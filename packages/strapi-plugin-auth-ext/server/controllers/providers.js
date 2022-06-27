const _ = require("lodash");
const path = require("path");
const fsPromises = require("fs/promises");
module.exports = ({ strapi }) => ({
  async addAuthStep(ctx) {
    return await strapi.service("plugin::auth-ext.grant-config").addAuthStep();
  },
  async removeAuthStep(ctx) {
    return await strapi
      .service("plugin::auth-ext.grant-config")
      .removeAuthStep();
  },
  async updateProviders(ctx) {
    const { step } = ctx.params;

    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: "Cannot be empty" }] }]);
    }
    const store = strapi.store({
      environment: "",
      type: "plugin",
      name: "auth-ext",
      key: "providers",
    });
    const allStepsProviders = await store.get();
    if (!allStepsProviders[step]) {
      return ctx.badRequest("");
    }
    allStepsProviders[step] = ctx.request.body.providers;

    await store.set({
      value: allStepsProviders,
    });
    if (process.env.ENABLE_TWOFACTOR_AUTOSAVE) {
      await updateProviderSettingsFile(step, allStepsProviders);
    }

    ctx.send({ ok: true });
  },

  async getProviders(ctx) {
    const { step } = ctx.params;
    let Allproviders =
      (await strapi
        .store({
          environment: "",
          type: "plugin",
          name: "auth-ext",
          key: "providers",
        })
        .get()) || [];
    console.log(Allproviders, step);
    const providers = Allproviders[Number(step)];
    for (const provider in providers) {
      if (provider !== "email") {
        providers[provider].redirectUri =
          strapi.plugins[
            "users-permissions"
          ].services.providers.buildRedirectUri(provider);
      }
    }

    ctx.send(providers);
  },

  async getProvidersSteps(ctx) {
    let providersOwners = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "auth-ext",
        key: "providers",
      })
      .get();

    ctx.send(providersOwners);
  },

  async updateSecondProviders(ctx) {
    const { ownerPlugin } = ctx.params;

    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: "Cannot be empty" }] }]);
    }

    const store = await strapi.store({
      environment: "",
      type: "plugin",
      name: "auth-ext",
      key: "providers-second",
    });

    await store.set({
      value: {
        ...(await store.get()),
        [ownerPlugin]: ctx.request.body.providers,
      },
    });
    if (process.env.ENABLE_TWOFACTOR_AUTOSAVE) {
      await updateProviderSettingsFile("second-step", {
        ...(await store.get()),
        [ownerPlugin]: ctx.request.body.providers,
      });
    }

    ctx.send({ ok: true });
  },

  async getSecondProviders(ctx) {
    const { ownerPlugin } = ctx.params;

    let second_providers =
      ((await strapi
        .store({
          environment: "",
          type: "plugin",
          name: "auth-ext",
          key: "providers-second",
        })
        .get()) || {})[ownerPlugin] || {};
    let providers =
      ((await strapi
        .store({
          environment: "",
          type: "plugin",
          name: "auth-ext",
          key: "providers",
        })
        .get()) || {})[ownerPlugin] || {};
    for (const provider in providers || {}) {
      providers[provider].enabled =
        second_providers[provider] && second_providers[provider].enabled;
      if (provider !== "email") {
        providers[provider].redirectUri =
          strapi.plugins[
            "users-permissions"
          ].services.providers.buildRedirectUri(provider);
      }
    }

    ctx.send(providers);
  },
});
const updateProviderSettingsFile = async (step, data) => {
  let outerConfig = {};
  const filePath = path.join(process.cwd(), "twofactorconfig.json");
  try {
    outerConfig = require(filePath);
  } catch (e) {}
  outerConfig[step] = data;
  await fsPromises.writeFile(filePath, JSON.stringify(outerConfig));
};
