module.exports = [
  {
    method: "GET",
    path: "/get-status/:id/:slug",
    handler: "entityLock.getStatusByIdAndSlug",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/set-status/:id/:slug",
    handler: "entityLock.setStatusByIdAndSlug",
    config: {
      policies: [],
    },
  },
  {
    method: "DELETE",
    path: "/delete-status/:id/:slug",
    handler: "entityLock.setStatusByIdAndSlug",
    config: {
      policies: [],
    },
  },
];
