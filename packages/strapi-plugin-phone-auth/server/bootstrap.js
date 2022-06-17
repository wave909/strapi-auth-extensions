const _ = require("lodash")
require('dotenv').config({path: require('find-config')('.env')});

const path = require('path')
const fs = require('fs')


module.exports = async ({strapi}) => {
  const pluginStore = strapi.store({
    environment: '',
    type: 'plugin',
    name: 'auth-ext',
    key: "providers"
  });
  const grantConfig = {
    phone: {
      enabled: true,
      icon: '',
      'register enabled': true,
      key: '',
      secret: '',
      callback: `${strapi.config.server.url}/phone/callback`,
      scope: ['phone', 'code', 'token'],
    }
  };

  const prevGrantConfig = ((await pluginStore.get()) || {})['phone-auth'] || {}
  // store grant auth config to db
  // when plugin_users-permissions_grant is not existed in db
  // or we have added/deleted provider here.

  if (true) {
    // merge with the previous provider config.
    _.keys(grantConfig).forEach((key) => {
      if (key in prevGrantConfig) {
        grantConfig[key] = _.merge(grantConfig[key], {})
      }
    })

    await pluginStore.set({
      value: {...(await pluginStore.get()), 'phone-auth': grantConfig},
    })
  }

  const i18nPath = path.join(
    process.cwd(),
    'data',
    'phone-templates.json',
  )

  let i18n;
  if (fs.existsSync(i18nPath)) {
    i18n = JSON.parse(await fs.promises.readFile(i18nPath, 'utf-8'))
  } else {
    i18n = {
      "auth-code": {
        "en": "Your code: <%= CODE %>"
      }
    }
    await fs.promises.mkdir(path.dirname(i18nPath), {recursive: true})
    await fs.promises.writeFile(i18nPath, JSON.stringify(i18n, undefined, 2), 'utf-8')
  }

  strapi.plugins["phone-auth"].templates = i18n
}
