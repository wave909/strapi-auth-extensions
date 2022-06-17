const _ = require("lodash")
module.exports = async ({strapi}) => {
  const pluginStore = strapi.store({
    environment: '',
    type: 'plugin',
    name: 'auth-ext',
    key: "providers"
  });

  const grantConfig = {
    email: {
      enabled: true,
      icon: 'envelope',
    },
    discord: {
      enabled: false,
      icon: 'discord',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/discord/callback`,
      scope: ['identify', 'email'],
    },
    facebook: {
      enabled: false,
      icon: 'facebook-square',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/facebook/callback`,
      scope: ['email'],
    },
    google: {
      enabled: false,
      icon: 'google',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/google/callback`,
      scope: ['email'],
    },
    github: {
      enabled: false,
      icon: 'github',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/github/callback`,
      scope: ['user', 'user:email'],
    },
    microsoft: {
      enabled: false,
      icon: 'windows',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/microsoft/callback`,
      scope: ['user.read'],
    },
    twitter: {
      enabled: false,
      icon: 'twitter',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/twitter/callback`,
    },
    instagram: {
      enabled: false,
      icon: 'instagram',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/instagram/callback`,
      scope: ['user_profile'],
    },
    vk: {
      enabled: false,
      icon: 'vk',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/vk/callback`,
      scope: ['email'],
    },
    twitch: {
      enabled: false,
      icon: 'twitch',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/twitch/callback`,
      scope: ['user:read:email'],
    },
    linkedin: {
      enabled: false,
      icon: 'linkedin',
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/auth/linkedin/callback`,
      scope: ['r_liteprofile', 'r_emailaddress'],
    },
    cognito: {
      enabled: false,
      icon: 'aws',
      key: '',
      secret: '',
      subdomain: 'my.subdomain.com',
      callback: `${strapi.config.server.url}/auth/cognito/callback`,
      scope: ['email', 'openid', 'profile'],
    },
    reddit: {
      enabled: false,
      icon: 'reddit',
      key: '',
      secret: '',
      state: true,
      callback: `${strapi.config.server.url}/auth/reddit/callback`,
      scope: ['identity'],
    },
    auth0: {
      enabled: false,
      icon: '',
      key: '',
      secret: '',
      subdomain: 'my-tenant.eu',
      callback: `${strapi.config.server.url}/auth/auth0/callback`,
      scope: ['openid', 'email', 'profile'],
    },
  };

  const prevGrantConfig = ((await pluginStore.get()) || {})["auth-ext"] || {};
  // store grant auth config to db
  // when plugin_users-permissions_grant is not existed in db
  // or we have added/deleted provider here.
  if (!prevGrantConfig || !_.isEqual(_.keys(prevGrantConfig), _.keys(grantConfig))) {
    // merge with the previous provider config.
    _.keys(grantConfig).forEach(key => {
      if (key in prevGrantConfig) {
        grantConfig[key] = _.merge(grantConfig[key], prevGrantConfig[key]);
      }
    });

    await pluginStore.set({value: {...await pluginStore.get(), "auth-ext": grantConfig}});
  }


}
