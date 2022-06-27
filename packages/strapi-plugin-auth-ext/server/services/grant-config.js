"use strict";
const _ = require("lodash");
const urljoin = require("url-join");

module.exports = ({ strapi }) => ({
  async addAuthStep() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "auth-ext",
      key: "providers",
    });
    const allStepsConfigs = (await pluginStore.get()) || [null];
    allStepsConfigs.push(null);
    await pluginStore.set({
      value: allStepsConfigs,
    });
    await this.syncGrantConfig();
    return await pluginStore.get();
  },
  async removeAuthStep() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "auth-ext",
      key: "providers",
    });
    const allStepsConfigs = (await pluginStore.get()) || [null];
    allStepsConfigs.length > 1 && allStepsConfigs.pop();
    await pluginStore.set({
      value: allStepsConfigs,
    });
    await this.syncGrantConfig();
    return await pluginStore.get();
  },
  async syncGrantConfig() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "auth-ext",
      key: "providers",
    });
    let allStepsConfigs = await pluginStore.get();
    if (!allStepsConfigs || !Array.isArray(allStepsConfigs)) {
      allStepsConfigs = [null];
    }
    const apiPrefix = strapi.config.get("api.rest.prefix");
    const baseURL = urljoin(strapi.config.server.url, apiPrefix, "auth");
    for (let step = 0; step < allStepsConfigs.length; step++) {
      const prevGrantConfig = allStepsConfigs[step];
      const grantConfig = strapi
        .service("plugin::auth-ext.grant-config")
        .getGrantConfig(baseURL);
      if (
        !prevGrantConfig ||
        !_.isEqual(_.keys(prevGrantConfig), _.keys(grantConfig))
      ) {
        // merge with the previous provider config.
        _.keys(grantConfig).forEach((key) => {
          if (key in (prevGrantConfig || {})) {
            grantConfig[key] = _.merge(grantConfig[key], prevGrantConfig[key]);
          }
        });
        allStepsConfigs[step] = grantConfig;

        await pluginStore.set({
          value: allStepsConfigs,
        });
      }
    }
  },
  getGrantConfig: (baseURL) => ({
    phone: {
      enabled: true,
      icon: "envelope",
      authorize_url: "http::/localhost:1337/phone-auth/sms",
      access_url: "http::/localhost:1337/phone-auth/confirm",
      key: "id",
      secret: "id",
      oauth: 2,
      callback: `${baseURL}/phone/callback`,
      scope: ["identify", "email"],
    },
    email: {
      enabled: true,
      icon: "envelope",
    },
    discord: {
      enabled: false,
      icon: "discord",
      key: "",
      secret: "",
      callback: `${baseURL}/discord/callback`,
      scope: ["identify", "email"],
    },
    facebook: {
      enabled: false,
      icon: "facebook-square",
      key: "",
      secret: "",
      callback: `${baseURL}/facebook/callback`,
      scope: ["email"],
    },
    google: {
      enabled: false,
      icon: "google",
      key: "",
      secret: "",
      callback: `${baseURL}/google/callback`,
      scope: ["email"],
    },
    github: {
      enabled: false,
      icon: "github",
      key: "",
      secret: "",
      callback: `${baseURL}/github/callback`,
      scope: ["user", "user:email"],
    },
    microsoft: {
      enabled: false,
      icon: "windows",
      key: "",
      secret: "",
      callback: `${baseURL}/microsoft/callback`,
      scope: ["user.read"],
    },
    twitter: {
      enabled: false,
      icon: "twitter",
      key: "",
      secret: "",
      callback: `${baseURL}/twitter/callback`,
    },
    instagram: {
      enabled: false,
      icon: "instagram",
      key: "",
      secret: "",
      callback: `${baseURL}/instagram/callback`,
      scope: ["user_profile"],
    },
    vk: {
      enabled: false,
      icon: "vk",
      key: "",
      secret: "",
      callback: `${baseURL}/vk/callback`,
      scope: ["email"],
    },
    twitch: {
      enabled: false,
      icon: "twitch",
      key: "",
      secret: "",
      callback: `${baseURL}/twitch/callback`,
      scope: ["user:read:email"],
    },
    linkedin: {
      enabled: false,
      icon: "linkedin",
      key: "",
      secret: "",
      callback: `${baseURL}/linkedin/callback`,
      scope: ["r_liteprofile", "r_emailaddress"],
    },
    cognito: {
      enabled: false,
      icon: "aws",
      key: "",
      secret: "",
      subdomain: "my.subdomain.com",
      callback: `${baseURL}/cognito/callback`,
      scope: ["email", "openid", "profile"],
    },
    reddit: {
      enabled: false,
      icon: "reddit",
      key: "",
      secret: "",
      state: true,
      callback: `${baseURL}/reddit/callback`,
      scope: ["identity"],
    },
    auth0: {
      enabled: false,
      icon: "",
      key: "",
      secret: "",
      subdomain: "my-tenant.eu",
      callback: `${baseURL}/auth0/callback`,
      scope: ["openid", "email", "profile"],
    },
    cas: {
      enabled: false,
      icon: "book",
      key: "",
      secret: "",
      callback: `${baseURL}/cas/callback`,
      scope: ["openid email"], // scopes should be space delimited
      subdomain: "my.subdomain.com/cas",
    },
  }),
});
