module.exports = ({ strapi }) => ({
  async authenticateLocalUser(params) {},
  async registerLocalUser(params) {},
  async findUserWithProviderAndProfile({ provider, profile }) {
    let existingUser;
    if (!profile) {
      return null;
    }
    if (provider === "local") {
      existingUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            provider,
            email: profile.email,
            username: profile.username,
          },
        });
    } else {
      const exAuthProvider = await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .findOne({
          where: {
            provider: { $eq: provider },
            email: { $eq: profile.email },
            username: { $eq: profile.username },
          },
        });
      existingUser =
        exAuthProvider &&
        (await strapi.db.query("plugin::users-permissions.user").findOne({
          where: {
            auth_providers: exAuthProvider.id,
          },
        }));
    }
    return existingUser;
  },
  async registerUserWithProviderAndProfile({
    provider,
    profile,
    profileToRegister = {},
  }) {
    const existingUser = await this.findUserWithProviderAndProfile({
      provider,
      profile,
    });
    const advanced = await strapi
      .store({ type: "plugin", name: "users-permissions", key: "advanced" })
      .get();

    const defaultRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: profileToRegister?.role
          ? { name: profileToRegister?.role }
          : { type: advanced.default_role },
      });

    if (existingUser) {
      throw new Error("User already exists");
    }

    if (provider === "local") {
      return await strapi.db.query("plugin::users-permissions.user").create({
        data: {
          ...profileToRegister,
          ...profile,
          provider,
          role: defaultRole.id,
        },
      });
    } else {
      const auth_provider = await strapi.db
        .query("plugin::auth-ext.auth-provider")
        .create({
          data: {
            provider,
            email: profile.email,
            username: profile.username,
          },
        });

      return await strapi.db.query("plugin::users-permissions.user").create({
        data: {
          ...profileToRegister,
          auth_providers: [auth_provider.id],
          role: defaultRole.id,
        },
      });
    }
  },
});
