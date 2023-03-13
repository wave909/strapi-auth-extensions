const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const { sanitize } = require("@strapi/utils");

module.exports = ({ strapi }) => ({
  async formatAuthStepOutput({ step, user, query, provider }) {
    console.log({ user, step });
    if (Number(step) + 1 >= (user.auth_steps_number || 1)) {
      const userEntity = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        user.id,
        { populate: query.populate || [] }
      );
      const userSchema = strapi.getModel("plugin::users-permissions.user");
      return {
        user: await sanitize.contentAPI.output(userEntity, userSchema),
        token: await strapi
          .service("plugin::users-permissions.jwt")
          .issue({ id: user.id }),
      };
    } else {
      const availableProviders = await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .findMany({
          where: {
            user: user.id,
            provider: { $ne: provider },
          },
        });
      if (provider !== "local") {
        if (user.password) {
          availableProviders.push({ provider: "local" });
        }
      }
      console.log({ user, availableProviders });
      return {
        availableProviders: availableProviders.map((it) => it.provider),
        token: await strapi
          .service("plugin::users-permissions.jwt")
          .issue({ auth_user: user.id }), //TODO add providers chain into token
      };
    }
  },
  transformLocalAuthParams(params) {
    const isEmail = emailRegExp.test(params.identifier);
    const res = { password: params.password };
    if (isEmail) {
      res.email = params.identifier.toLowerCase();
    } else {
      res.username = params.identifier;
    }
    return res;
  },
});
