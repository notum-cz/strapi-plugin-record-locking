/**
 * Application methods
 */
import bootstrap from './bootstrap';
import destroy from './destroy';

/**
 * Plugin server methods
 */
import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';

import routes from './routes';

export default {
  register: () => {},
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  contentTypes,
  services: {},
  policies: {},
  middlewares: {},
};
