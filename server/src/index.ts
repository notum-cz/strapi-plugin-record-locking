/**
 * Application methods
 */
import bootstrap from './bootstrap';
import destroy from './destroy';

/**
 * Plugin server methods
 */
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';

export default {
  bootstrap,
  destroy,
  controllers,
  routes,
  contentTypes,
};
