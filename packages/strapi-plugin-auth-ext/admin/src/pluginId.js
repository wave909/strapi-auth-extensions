const pluginPkg = require("../../package.json");
const pluginId = pluginPkg.name.replace(/^@inner9\/strapi-plugin-/i, "");

module.exports = pluginId;
