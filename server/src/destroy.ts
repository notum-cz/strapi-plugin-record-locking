import type {Server} from "socket.io"
import type { Core } from '@strapi/strapi';

const destroy = ({ strapi }: { strapi: Core.Strapi & {io?: Server} }) => {
  if (strapi?.io?.close) {
    strapi.io.close();
  }
  if (strapi.db.metadata.has('plugin::record-locking.open-entity')) {
    strapi.db.query('plugin::record-locking.open-entity').deleteMany();
  }
};

export default destroy;
