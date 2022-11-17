"use strict";

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];
module.exports = ({ strapi }) => ({
  async getProfile({ provider, query, callback }) {
    const emailTemplate =
      process.env.PHONE_AUTH_EMAIL_TEMPLATE || "disabled@wave909.com";

    const access_token = query.access_token || query.code || query.oauth_token;
    const { providerArgs, profileToRegister } = query;

    switch (provider) {
      case "phone": {
        try {
          if (access_token) {
            const verified = await strapi.plugins[
              "users-permissions"
            ].services.jwt.verify(access_token);
            if (verified) {
              callback(null, {
                ...(profileToRegister || {}),
                username: verified.phone,
                email: verified.phone + emailTemplate,
              });
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
              callback(
                formatError({
                  id: "Auth.form.error.invalid",
                  message: "Invalid request token.",
                })
              );
              return;
            }

            const codeResponse = await strapi.plugins[
              "phone-auth"
            ].services.sms.validateCode({ to: phone, code, sid: requestToken });

            if (!codeResponse.ok) {
              callback(
                formatError({
                  id: "Auth.form.code.error.invalid",
                  message: codeResponse.status,
                })
              );
              return;
            }
            callback(null, {
              ...(profileToRegister || {}),
              username: phone,
              email: phone + emailTemplate,
            });
          }
        } catch (e) {
          callback(e);
        }
        break;
      }
    }
  },
});
