import type { Core } from '@strapi/strapi';
import DEFAULT_TRANSPORTS from '../constants/transports';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSettings(ctx) {
    const settings = {
      transports: strapi.plugin('record-locking').config('transports') || DEFAULT_TRANSPORTS,
    };

    ctx.send(settings);
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
    const { entityDocumentId } = ctx.request.params;
    const { id: userId } = ctx.state.user;
    const data = await strapi.db.query('plugin::record-locking.open-entity').findOne({
      where: {
        entityDocumentId,
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
    const { entityDocumentId } = ctx.request.params;
    const { id } = ctx.state.user;
    const currentUserId = String(id);

    await strapi.db.query('plugin::record-locking.open-entity').create({
      data: {
        user: currentUserId,
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
        entityDocumentId,
      },
    });

    return 'DELETED';
  },
});

export default controller;
