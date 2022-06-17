module.exports = {
  "content-api": {
    routes: [
      {
        "method": "POST",
        "path": "/sms",
        "handler": "PhoneAuth.codeRequest",
        "config": {
          "policies": [],
          "description": "Request an SMS for the phone authentication",
          "tag": {
            "plugin": "users-permissions",
            "name": "User"
          }
        }
      },
      {
        "method": "POST",
        "path": "/sms/confirm",
        "handler": "PhoneAuth.codeConfirm",
        auth: {
          type: 'content-api',

        },

        "config": {
          "policies": [],
          "description": "Send an SMS code for confirmation",
          "tag": {
            "plugin": "users-permissions",
            "name": "User"
          }
        }
      }
    ],
    type: "content-api"
  }
}
