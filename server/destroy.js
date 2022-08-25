'use strict';

module.exports = ({ strapi }) => {
  if (strapi?.io?.close) {
    strapi.io.close();
  }
  strapi.db.query("plugin::record-locking.open-entity").deleteMany();
};