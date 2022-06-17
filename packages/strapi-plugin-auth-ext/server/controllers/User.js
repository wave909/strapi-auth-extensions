module.exports = ({strapi}) => ({
  async addSecondFactorFieldsToUserModel(ctx) {
    const contentTypeService = strapi.plugins['content-type-builder'].services.contenttypes;

    const userModel = contentTypeService.formatContentType(strapi.contentTypes["plugins::users-permissions.user"])
    const newAttributes = {
      ...userModel.schema.attributes,
      second_username: {
        "type": "string",
        "minLength": 3,
        "unique": true,
        "configurable": false,
        "required": true
      },
      second_email: {
        "type": "email",
        "minLength": 6,
        "configurable": false,
        "required": true
      },
      second_provider: {
        "type": "string",
        "configurable": false
      },
      two_step_auth: {
        "type": "boolean",
        "configurable": true,
        "required": true,
        "default": ctx.request.body.default || false
      },
    }
    return await contentTypeService.editContentType("plugins::users-permissions.user", {
      contentType: {
        attributes: newAttributes
      },
      components: [],
    });
  }
})
