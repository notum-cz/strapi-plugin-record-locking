"use strict";

module.exports = {
  async getStatusByIdAndSlug(ctx) {
    const { id, slug } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const data = await strapi.db
      .query("plugin::entity-lock.open-entity")
      .findOne({
        where: {
          entityItentificator: id,
          entityType: slug,
          user: {
            $not: userId,
          },
        },
      });

    if (data) {
      const user = await strapi.db
        .query("admin::user")
        .findOne({ where: { id: data.user } });

      return {
        editedBy: `${user.firstname} ${user.lastname}`,
      };
    }

    return false;
  },
  async setStatusByIdAndSlug(ctx) {
    const { id, slug } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const data = await strapi.db
      .query("plugin::entity-lock.open-entity")
      .create({
        data: {
          user: String(userId),
          entityType: slug,
          entityItentificator: id,
        },
      });

    return true;
  },
  async deleteStatusByIdAndSlug(ctx) {
    const { id, slug } = ctx.request.params;
    const { id: userId } = ctx.state.user;

    const data = await strapi.db
      .query("plugin::entity-lock.open-entity")
      .deleteMany({
        where: {
          user: String(userId),
          entityType: slug,
          entityItentificator: id,
        },
      });

    return "DELETED";
  },
};
