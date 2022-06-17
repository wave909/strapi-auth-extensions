module.exports = {
  admin: {
    routes: [
      {
        "method": "PUT",
        "path": "/providers/:ownerPlugin",
        "handler": "Providers.updateProviders",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "phone-auth",
            "name": "User"
          }
        }
      },
      {
        "method": "GET",
        "path": "/providers/:ownerPlugin",
        "handler": "Providers.getProviders",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "phone-auth",
            "name": "User"
          }
        }
      },
      {
        "method": "GET",
        "path": "/providers-owners",
        "handler": "Providers.getProvidersOwners",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "phone-auth",
            "name": "User"
          }
        }
      },
      {
        "method": "PUT",
        "path": "/second-step-providers/:ownerPlugin",
        "handler": "Providers.updateSecondProviders",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "phone-auth",
            "name": "User"
          }
        }
      },
      {
        "method": "GET",
        "path": "/second-step-providers/:ownerPlugin",
        "handler": "Providers.getSecondProviders",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "phone-auth",
            "name": "User"
          }
        }
      },
      {
        "method": "POST",
        "path": "/auth/prepare-user-model",
        "handler": "User.addSecondFactorFieldsToUserModel",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "auth-ext",
            "name": "User"
          }
        }
      },
    ],
    type: "admin"
  },
  "content-api": {
    routes: [
      {
        "method": "POST",
        "path": "/auth/:pluginOwner/:provider/first-step",
        "handler": "multifactorAuth.firstStepCallback",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "auth-ext",
            "name": "User"
          }
        }
      },
      {
        "method": "POST",
        "path": "/auth/:pluginOwner/:provider/second-step",
        "handler": "multifactorAuth.secondStepCallback",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "auth-ext",
            "name": "User"
          }
        }
      }
    ],
    type: "content-api"
  }
}

