module.exports = {
  admin: {
    routes: [
      {
        method: "PUT",
        path: "/providers/:step",
        handler: "providers.updateProviders",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "phone-auth",
            name: "User",
          },
        },
      },
      {
        method: "GET",
        path: "/providers-steps",
        handler: "providers.getProvidersSteps",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "phone-auth",
            name: "User",
          },
        },
      },
      {
        method: "GET",
        path: "/providers/:step",
        handler: "providers.getProviders",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "phone-auth",
            name: "User",
          },
        },
      },
      {
        method: "POST",
        path: "/add-providers-step",
        handler: "providers.addAuthStep",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "phone-auth",
            name: "User",
          },
        },
      },
      {
        method: "POST",
        path: "/remove-providers-step",
        handler: "providers.removeAuthStep",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "phone-auth",
            name: "User",
          },
        },
      },
    ],
    type: "admin",
  },
  "content-api": {
    routes: [
      {
        method: "POST",
        path: "/auth/:provider/auth-step/:step",
        handler: "authExt.authStep",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "auth-ext",
            name: "User",
          },
        },
      },
      {
        method: "POST",
        path: "/auth/:provider/reset",
        handler: "authExt.resetProvider",
        config: {
          policies: [],
          description: "Request an SMS for the phone authentication",
          tag: {
            plugin: "auth-ext",
            name: "User",
          },
        },
      },
    ],
    type: "content-api",
  },
};
