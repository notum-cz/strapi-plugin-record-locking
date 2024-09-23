import pluginPkg  from '../../package.json'

export const PLUGIN_ID = pluginPkg.name.replace(/^@strapi\/plugin-/i, '');
