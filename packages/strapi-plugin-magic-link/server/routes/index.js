//
module.exports = [
  {
    "method": "GET",
    "path": "/:id",
    "handler": "MagicLink.generateMagicLink",
    "config": {
      "policies": [],
      "description": "Request a magic link for a given user id.",
      "tag": {
        "plugin": "magic-link",
        "name": "User"
      }
    }
  },
  {
    "method": "GET",
    "path": "/auth/:magicLink",
    "handler": "MagicLink.confirmMagicLink",
    "config": {
      "policies": [],
      "description": "Authorize via the magic link.",
      "tag": {
        "plugin": "magic-link",
        "name": "User"
      }
    }
  }
]
