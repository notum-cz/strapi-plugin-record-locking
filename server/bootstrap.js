"use strict";

module.exports = ({ strapi }) => {
  // bootstrap phase
  const io = require("socket.io")(strapi.server.httpServer);

  io.on("connection", function (socket) {
    socket.on("openEntity", async ({ entityId, entitySlug, userId }) => {
      const usersPermissionsForThisContent = await strapi.db.connection
        .select("p.id", "p.action", "p.subject")
        .from("admin_permissions AS p")
        .innerJoin(
          "admin_permissions_role_links AS prl",
          "p.id",
          "prl.permission_id"
        )
        .innerJoin(
          "admin_users_roles_links AS url",
          "prl.role_id",
          "url.role_id"
        )
        .where("url.user_id", userId)
        .andWhere("p.subject", entitySlug);
      const userHasAdequatePermissions =
        usersPermissionsForThisContent.filter((perm) =>
          ["create", "delete", "publish"].some((operation) =>
            perm.action.includes(operation)
          )
        ).length !== 0;
      if (userHasAdequatePermissions) {
        await strapi.db.query("plugin::record-locking.open-entity").create({
          data: {
            user: String(userId),
            entityType: entitySlug,
            entityIdentifier: entityId,
            connectionId: socket.conn.id,
          },
        });
      }
    });

    socket.on("closeEntity", async ({ entityId, entitySlug, userId }) => {
      await strapi.db.query("plugin::record-locking.open-entity").deleteMany({
        where: {
          user: String(userId),
          entityType: entitySlug,
          entityIdentifier: entityId,
        },
      });
    });

    socket.on("disconnect", async (data) => {
      await strapi.db.query("plugin::record-locking.open-entity").deleteMany({
        where: {
          connectionId: socket.conn.id,
        },
      });
    });
  });

  strapi.db.query("plugin::record-locking.open-entity").deleteMany();
  strapi.io = io;
};
