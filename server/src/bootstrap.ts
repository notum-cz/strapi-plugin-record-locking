import type { Core } from '@strapi/strapi';
import { Server } from 'socket.io';
import { isCollectionLockable } from './utils/lockable';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase

  const include: string[] | undefined = strapi.plugin('record-locking').config('include');
  const exclude: string[] | undefined = strapi.plugin('record-locking').config('exclude');

  if (include && exclude) {
    console.warn('Both include and exclude cannot be used together for record-locking, ignoring exclude configuration.');
  }

  const io = new Server(strapi.server.httpServer);

  const getUserIdFromToken = (token: string): string | undefined  =>
    strapi.admin.services.token.decodeJwtToken?.(token)?.payload?.id ??
    // @ts-expect-error TS2339: sessionManager does not exist on strapi typings for Strapi < v5.24.2
    strapi.sessionManager?.('admin').validateAccessToken?.(token)?.payload?.userId;

  const doesUserHaveAdequatePermissions = async (token: string, entityId: string) => {
    const userId = getUserIdFromToken(token);

    if (userId) {
      const usersPermissionsForThisContent = await strapi.db.connection
          .select('p.id', 'p.action', 'p.subject')
          .from('admin_permissions AS p')
          .innerJoin('admin_permissions_role_lnk AS prl', 'p.id', 'prl.permission_id')
          .innerJoin('admin_users_roles_lnk AS url', 'prl.role_id', 'url.role_id')
          .where('url.user_id', userId)
          .andWhere('p.subject', entityId);
          const userHasAdequatePermissions =
            usersPermissionsForThisContent.filter((perm) =>
              ['create', 'delete', 'publish'].some((operation) => perm.action.includes(operation))
            ).length !== 0;
      return userHasAdequatePermissions;
    }
    return false;
  }
  io.on('connection', (socket) => {
    socket.on('openEntity', async ({ entityDocumentId, entityId }) => {
      try {
        const lockable = isCollectionLockable(entityId);
        const userHasAdequatePermissions = await doesUserHaveAdequatePermissions(socket.handshake.auth.token, entityId);
        if (lockable && userHasAdequatePermissions) {
            const userId = getUserIdFromToken(socket.handshake.auth.token);
            await strapi.db.query('plugin::record-locking.open-entity').create({
              data: {
                user: String(userId),
                entityId,
                entityDocumentId,
                connectionId: socket.id,
              },
            });

        }
    } catch (error) {
      console.error('Error creating a record-locking entry:', error);
    }
    });

    socket.on('takeoverEntity', async ({ entityId, entityDocumentId }, callback) => {
      try {
        const lockable = isCollectionLockable(entityId);
        if (!lockable) {
          callback({success: false, error: 'Collection is configured to be not lockable.'});
          return;
        }
        const userHasAdequatePermissions = await doesUserHaveAdequatePermissions(socket.handshake.auth.token, entityId);
        if (userHasAdequatePermissions) {
          const existingLockRecords = await strapi.db.query('plugin::record-locking.open-entity').findMany({
            where: {
              entityId: entityId,
              entityDocumentId,
            },
          });
          if (existingLockRecords.length > 0) {
            await strapi.db.query('plugin::record-locking.open-entity').deleteMany({
              where: {
                entityId: entityId,
                entityDocumentId,
              },
            });
          }
          const userId = getUserIdFromToken(socket.handshake.auth.token);
          await strapi.db.query('plugin::record-locking.open-entity').create({
            data: {
              user: String(userId),
              entityId,
              entityDocumentId,
              connectionId: socket.id,
            },
          });
          const user = await strapi.db.query('admin::user').findOne({ where: { id: String(userId) } });
          for (const record of existingLockRecords) {
            if (record.connectionId !== socket.id) {
              io.to(record.connectionId).emit('takeoverEntityPerformed', { entityId, entityDocumentId, username: `${user.firstname} ${user.lastname}` });
            }
          }                  
          callback({success: true});
        }
        else {
          callback({success: false, error: 'User does not have adequate permissions.'});
        }
      } catch (error) {
        console.error('Error taking over a record-locking entry:', error);
        callback({success: false, error: error?.message ?? 'Unknown error occurred'});
      }

    });
    socket.on('closeEntity', async ({ entityId, entityDocumentId, userId }) => {
      await strapi.db.query('plugin::record-locking.open-entity').deleteMany({
        where: {
          user: String(userId),
          entityId: entityId,
          entityDocumentId,
        },
      });
    });

    socket.on('disconnect', async () => {
      await strapi.db.query('plugin::record-locking.open-entity').deleteMany({
        where: {
          connectionId: socket.id,
        },
      });
    });
  });

  strapi.db.query('plugin::record-locking.open-entity').deleteMany();
  (strapi as any).io = io;
};

export default bootstrap;
