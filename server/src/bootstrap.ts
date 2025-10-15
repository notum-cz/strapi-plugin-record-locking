import type { Core } from '@strapi/strapi';
import { Server } from 'socket.io';

const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase

  const io = new Server(strapi.server.httpServer);

  const getUserIdFromToken = (token: string): string | undefined  =>
    strapi.admin.services.token.decodeJwtToken?.(token)?.payload?.id ??
    // @ts-expect-error TS2339: sessionManager does not exist on strapi typings for Strapi < v5.24.2
    strapi.sessionManager?.('admin').validateAccessToken?.(token)?.payload?.userId;

  io.on('connection', (socket) => {
    socket.on('openEntity', async ({ entityDocumentId, entityId }) => {
      try {
        const userId = getUserIdFromToken(socket.handshake.auth.token);

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
          if (userHasAdequatePermissions) {
            await strapi.db.query('plugin::record-locking.open-entity').create({
              data: {
                user: String(userId),
                entityId,
                entityDocumentId,
                connectionId: socket.id,
              },
            });
          }
        }
    } catch (error) {
      console.error('Error creating a record-locking entry:', error);
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
