const _ = require("lodash");
module.exports = ({ strapi }) => ({
  async authStep(ctx) {
    console.log("AUTH_STEP");
    try {
      const { provider, step } = ctx.params;
      ctx.query.providerArgs = ctx.request.body.providerArgs || {};
      await checkProviderEnabled({ strapi, provider, step });

      let user;
      let providersProfile = await strapi
        .service("plugin::auth-ext.providers-profile")
        .getProvidersProfile({ provider, query: ctx.query });
      if (provider === "local" && !providersProfile) {
        providersProfile = strapi
          .service("plugin::auth-ext.transforms")
          .transformLocalAuthParams(ctx.query.providerArgs);
        if (!providersProfile.email) {
          providersProfile.email =
            providersProfile.username + "disabled@wave909.com";
        }
        if (!providersProfile.username) {
          providersProfile.username = providersProfile.email;
        }
      }
      if (!providersProfile) {
        return ctx.badRequest("Invalid credentials");
      }
      if (step == 0) {
        user = await strapi
          .service("plugin::auth-ext.auth")
          .findUserWithProviderAndProfile({
            provider,
            profile: providersProfile,
          });
        if (!user) {
          user = await strapi
            .service("plugin::auth-ext.auth")
            .registerUserWithProviderAndProfile({
              provider,
              profile: providersProfile,
              profileToRegister: ctx.request.body.profileToRegister,
            });
        }
      } else {
        const { token } = ctx.request.body;
        const { auth_user, ...rest } = token
          ? await strapi.service("plugin::users-permissions.jwt").verify(token)
          : {};
        if (!auth_user && step > 0) {
          return ctx.badRequest("Invalid token");
        }
        user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({ where: { id: auth_user } });
        console.log({ user });
        if (!user) {
          return ctx.notFound();
        }
        const userAuthProvider = await strapi
          .service("plugin::auth-ext.auth-provider")
          .findUserAuthProvider({ user: auth_user, provider });
        console.log({ userAuthProvider });

        if (userAuthProvider) {
          if (
            userAuthProvider.email !== providersProfile.email ||
            userAuthProvider.username !== providersProfile.username
          ) {
            return ctx.badRequest("invalid credentials");
          }
        } else {
          await strapi
            .service("plugin::auth-ext.auth-provider")
            .connectUserAuthProvider({
              user: auth_user,
              provider,
              providersProfile,
            });
        }
      }
      return await strapi
        .service("plugin::auth-ext.transforms")
        .formatAuthStepOutput({ step, user, query: ctx.query });
    } catch (e) {
      console.log(e);
      return ctx.badRequest(e);
    }
  },
});
const checkProviderEnabled = async ({ strapi, provider, step }) => {
  const providersSettings =
    (await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "auth-ext",
        key: `providers`,
      })
      .get()) || [];
  const settings = providersSettings[step];
  if (!settings) {
    throw new Error("This step is disabled");
  }
  const _provider = provider === "local" ? "email" : provider;
  if (!_.get(settings, [_provider, "enabled"])) {
    throw new Error("This provider is disabled.");
  }
};
