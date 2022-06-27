module.exports = ({ strapi }) => ({
  async findUserAuthProvider({ user, provider }) {
    if (provider === "local") {
      const _user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user },
        });
      if (_user.provider !== "local") {
        return null;
      }
      return _user;
    } else {
      return await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .findOne({ where: { user: user, provider } });
    }
  },
  async connectUserAuthProvider({ user, provider, providersProfile = {} }) {
    if (provider === "local") {
      console.log(providersProfile);
      return await strapi.entityService.update(
        "plugin::users-permissions.user",
        user,
        {
          data: { ...providersProfile, provider: "local" },
        }
      );
    } else {
      return await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .create({ data: { user, provider, ...providersProfile } });
    }
  },
  async disconnectProvider({ user, provider }) {
    const providersProfile = await this.findUserAuthProvider({
      user,
      provider,
    });
    if (!providersProfile) {
      return null;
    }
    if (provider === "local") {
      return await strapi.entityService.update(
        "plugin::users-permissions.user",
        user,
        {
          data: { provider: null },
        }
      );
    } else {
      return await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .delete({ where: { id: providersProfile.id } });
    }
  },
});
