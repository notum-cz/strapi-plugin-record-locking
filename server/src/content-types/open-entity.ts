export default {
  kind: 'collectionType',
  collectionName: 'open-entity',
  info: {
    singularName: 'open-entity',
    pluralName: 'open-entities',
    displayName: 'Open Entity',
    description: 'List of open entities for record locking plugin.',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    entityDocumentId: {
      type: 'string',
      configurable: false,
    },
    entityId: {
      type: 'string',
      configurable: false,
    },
    user: {
      type: 'string',
      configurable: false,
    },
    connectionId: {
      type: 'string',
      configurable: false,
    },
  },
};
