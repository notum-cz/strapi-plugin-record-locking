export default [
  {
    method: 'GET',
    path: '/settings',
    handler: 'controller.getSettings',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/get-status/:entityDocumentId',
    handler: 'controller.getStatusBySlug',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/get-status/:entityId/:entityDocumentId',
    handler: 'controller.getStatusByIdAndSlug',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/set-status/:entityId/:entityDocumentId',
    handler: 'controller.setStatusByIdAndSlug',
    config: {
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/delete-status/:entityId/:entityDocumentId',
    handler: 'controller.deleteStatusByIdAndSlug',
    config: {
      policies: [],
    },
  },
];
