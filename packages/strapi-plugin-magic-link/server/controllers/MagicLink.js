'use strict'

/**
 * magicLink.js controller
 *
 * @description: A set of functions called "actions" of the `phone-auth` plugin.
 */
require('dotenv').config()
const formatError = (error) => [
  {messages: [{id: error.id, message: error.message, field: error.field}]},
]
const {sanitize} = require('@strapi/utils')

const sanitizeOutput = async (data, ctx) => {
  const schema = strapi.getModel('plugin::user-permissions.user');
  //const {auth} = ctx.state;
  console.log(data, schema)
  return await sanitize.contentAPI.output(data, schema); // ,{auth}
};

module.exports = {
  // TODO: Consider using an off-the-shelf SMS OAuth serivce
  // fixme: Enable rate limiting

  async generateMagicLink(ctx) {
    const {id} = ctx.params
    let user
    try {
      user = await strapi.db.query('plugin::users-permissions.user').findOne({id})
    } catch (e) {
      console.log(e)
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Invalid id',
        }),
      )
    }

    if (!user) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Invalid id',
        }),
      )
    }

    try {
      let magicLink = await strapi.plugins[
        'auth-link'
        ].services.magicLink.generateMagicLink({to: id})
      console.log(process.env)
      magicLink.magicLink =
        (process.env.MAGIC_URL || '') +
        (process.env.MAGIC_PARAM ? '?' + process.env.MAGIC_PARAM + '=' : '/') +
        magicLink.magicLink
      return ctx.send({
        magicLink,
      })
    } catch (e) {
      console.error(e)
      // fixme: Proper error codes
      return ctx.badRequest(
        null,
        formatError({
          id: 'Magic.link.form.error.invalid',
          message: e.message,
        }),
      )
    }
  },

  async confirmMagicLink(ctx, next) {
    const {magicLink} = ctx.params
    let user

    const codeResponse = await strapi.plugins[
      'auth-link'
      ].services.magicLink.validateMagicLink(magicLink)

    if (!codeResponse.ok) {
      return ctx.unauthorized()
    }
    try {
      console.log(codeResponse.id)
      const id = Number(codeResponse.id)
      user = await strapi.db.query('plugin::users-permissions.user').findOne({id})
      console.log(user)
    } catch (e) {
      console.log(e)
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Invalid id',
        }),
      )
    }

    if (!user) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Invalid id',
        }),
      )
    }

    ctx.send({
      jwt: strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      }),
      user: await sanitizeOutput(user, ctx)
      //Not sure if the new sanitizing works good sanitizeOutput(user, ctx)
      // Just tell user id and name
      ,
    })
  },
}
