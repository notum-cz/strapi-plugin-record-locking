module.exports = {
  info: {
    tableName: "open-entity",
    singularName: "open-entity", // kebab-case mandatory
    pluralName: "open-entities", // kebab-case mandatory
    displayName: "Open Entities",
    description: "A regular content-type",
    kind: "collectionType",
  },
  options: {
    draftAndPublish: false,
  },
  //   pluginOptions: {
  //     "content-manager": {
  //       visible: false,
  //     },
  //     "content-type-builder": {
  //       visible: false,
  //     },
  //   },
  attributes: {
    entityItentificator: {
      type: "string",
      configurable: false,
    },
    entityType: {
      type: "string",
      configurable: false,
    },
    user: {
      type: "string",
      configurable: false,
    },
    connectionId: {
      type: "string",
      configurable: false,
    },
  },
};
