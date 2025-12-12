import type { Core } from '@strapi/strapi';
import DEFAULT_TRANSPORTS from '../constants/transports';
import { DEFAULT_FOR_SHOW_TAKEOVER_BUTTON } from '../constants/config';
import { isCollectionLockable } from '../utils/lockable';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSettings(ctx) {
    const settings = {
      transports:
        strapi.plugin('record-locking').config('transports') || DEFAULT_TRANSPORTS,
      showTakeoverButton: strapi.plugin('record-locking').config('showTakeoverButton') ?? DEFAULT_FOR_SHOW_TAKEOVER_BUTTON,
      include: strapi.plugin('record-locking').config('include'),
      exclude: strapi.plugin('record-locking').config('exclude'),
    };

    ctx.send(settings);
  },

  async isCollectionLockable(ctx) {
    const { entityId } = ctx.request.params;
    const isLockable = isCollectionLockable(entityId);
    ctx.send(isLockable);
  },

  async getStatusBySlug(ctx) {
    const { entityId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const data = await strapi.db.query('plugin::record-locking.open-entity').findOne({
      where: {
        entityId,
        user: {
          $not: userId,
        },
      },
    });

    if (data) {
      const user = await strapi.db.query('admin::user').findOne({ where: { id: data.user } });

      return {
        editedBy: `${user.firstname} ${user.lastname}`,
      };
    }

    return false;
  },

  async getStatusByIdAndSlug(ctx) {
    const { entityId, entityDocumentId } = ctx.request.params;
    const { id: userId } = ctx.state.user;
    const data = await strapi.db.query('plugin::record-locking.open-entity').findOne({
      where: {
        entityDocumentId,
        entityId,
        user: {
          $not: userId,
        },
      },
    });

    if (data) {
      const user = await strapi.db.query('admin::user').findOne({ where: { id: data.user } });

      return {
        editedBy: `${user.firstname} ${user.lastname}`,
      };
    }

    return false;
  },

  async setStatusByIdAndSlug(ctx) {
    const { entityId, entityDocumentId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    await strapi.db.query('plugin::record-locking.open-entity').create({
      data: {
        user: String(userId),
        entityId: entityId,
        entityDocumentId,
      },
    });

    return true;
  },

  async deleteStatusByIdAndSlug(ctx) {
    const { entityId, entityDocumentId } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    await strapi.db.query('plugin::record-locking.open-entity').deleteMany({
      where: {
        user: String(userId),
        entityId: entityId,
        entityDocumentId,
      },
    });

    return 'DELETED';
  },
});

export default controller;
