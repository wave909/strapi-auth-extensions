'use strict'

/**
 * sms.js controller
 *
 * @description: A set of functions called "actions" of the `phone-auth` plugin.
 */
const formatError = (error) => [
  {messages: [{id: error.id, message: error.message, field: error.field}]},
]

module.exports = ({strapi}) => ({
  // TODO: Consider using an off-the-shelf SMS OAuth serivce
  // fixme: Add rate limiting

  async codeRequest(ctx, next) {
    const {phone, locale} = ctx.request.body;

    //TODO :use phone number validation?
    if (phone && phone.length > 15) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.invalid",
          message: "Invalid phone number.",
        })
      );
    }

    try {
      const {token} = await strapi.plugins["phone-auth"].services.sms.sendCode({
        to: phone, locale
      });

      return ctx.send({
        phone,
        token,
        sent: true,
      });
    } catch (e) {
      console.error(e);
      // fixme: Proper error codes
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.invalid",
          message: e.message,
        })
      );
    }
  },

  async codeConfirm(ctx) {
    const {phone, token, code} = ctx.request.body;
    let [error, response] = [null, null];
    await strapi.plugins["phone-auth"].services.providers.getProfile(
      "phone",
      {providerArgs: {phone, token, code}},
      (err, data) => {
        if (err) {
          error = err;
        } else {
          response = data;
        }
      }
    );
    if (error) {
      return ctx.badRequest(null, error);
    }

    return {
      token: await strapi.plugins["users-permissions"].services.jwt.issue({
        ...response,
      }),
    };
  },
})
