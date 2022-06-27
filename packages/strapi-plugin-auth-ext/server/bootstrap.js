const _ = require("lodash");
module.exports = async ({ strapi }) => {
  await strapi.service("plugin::auth-ext.grant-config").syncGrantConfig();
};
