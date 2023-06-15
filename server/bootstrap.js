"use strict";

module.exports = ({ strapi }) => {
  // bootstrap phase
  const io = require("socket.io")(strapi.server.httpServer);

  io.on("connection", function (socket) {
    socket.on("openEntity", async ({ entityId, entitySlug, userId }) => {
      await strapi.db.query("plugin::record-locking.open-entity").create({
        data: {
          user: String(userId),
          entityType: entitySlug,
          entityItentificator: entityId,
          connectionId: socket.conn.id,
        },
      });
    });

    socket.on("closeEntity", async ({ entityId, entitySlug, userId }) => {
      await strapi.db.query("plugin::record-locking.open-entity").deleteMany({
        where: {
          user: String(userId),
          entityType: entitySlug,
          entityItentificator: entityId,
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
