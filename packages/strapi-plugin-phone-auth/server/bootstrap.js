const _ = require("lodash");
require("dotenv").config({ path: require("find-config")(".env") });

const path = require("path");
const fs = require("fs");

module.exports = async ({ strapi }) => {
  const i18nPath = path.join(process.cwd(), "data", "phone-templates.json");

  let i18n;
  if (fs.existsSync(i18nPath)) {
    i18n = JSON.parse(await fs.promises.readFile(i18nPath, "utf-8"));
  } else {
    i18n = {
      "auth-code": {
        en: "Your code: <%= CODE %>",
      },
    };
    await fs.promises.mkdir(path.dirname(i18nPath), { recursive: true });
    await fs.promises.writeFile(
      i18nPath,
      JSON.stringify(i18n, undefined, 2),
      "utf-8"
    );
  }

  strapi.plugins["phone-auth"].templates = i18n;

  const grantConfigService = strapi.service("plugin::auth-ext.grant-config");
  const providersService = strapi.service("plugin::auth-ext.providers-profile");
  const getProvidersProfile = providersService.getProvidersProfile;
  providersService.getProvidersProfile = async ({
    provider,
    query,
    access_token,
  }) => {
    const emailTemplate =
      process.env.PHONE_AUTH_EMAIL_TEMPLATE || "disabled@wave909.com";

    const { providerArgs, profileToRegister } = query;

    switch (provider) {
      case "phone": {
        if (access_token) {
          const verified = await strapi.plugins[
            "users-permissions"
          ].services.jwt.verify(access_token);
          if (verified) {
            return {
              username: verified.phone,
              email: verified.phone + emailTemplate,
            };
          }
        } else {
          const { token, code } = providerArgs || {};
          const phone = providerArgs.phone && providerArgs.phone.replace(/[^+\d]/g,'');

          let requestToken = false;
          try {
            const payload = await strapi.plugins[
              "users-permissions"
            ].services.jwt.verify(token);
            requestToken = payload && payload.request;
          } catch (e) {}
          if (!requestToken) {
            throw new Error("Invalid request token.");
          }

          const codeResponse = await strapi.plugins[
            "phone-auth"
          ].services.sms.validateCode({ to: phone, code, sid: requestToken });

          if (!codeResponse.ok) {
            throw new Error(codeResponse.status);
          }
          return {
            username: phone,
            email: phone + emailTemplate,
          };
        }
        break;
      }
      default:
        return await getProvidersProfile({ provider, query, access_token });
    }
    const getGrantConfig = grantConfigService.getGrantConfig;
    grantConfigService.getGrantConfig = (basURL) => ({
      ...getGrantConfig(basURL),
      phone: { enabled: true },
    });
  };
};
