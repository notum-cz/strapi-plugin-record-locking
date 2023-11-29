module.exports = [
  {
    method: "GET",
    path: "/settings",
    handler: "entityLock.getSettings",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/get-status/:slug",
    handler: "entityLock.getStatusBySlug",
    config: {
      policies: [],
    },
  },
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
    handler: "entityLock.deleteStatusByIdAndSlug",
    config: {
      policies: [],
    },
  },
];
