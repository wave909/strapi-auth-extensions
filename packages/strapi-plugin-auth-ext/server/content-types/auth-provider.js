module.exports = {
  info: {
    tableName: 'auth-provider',
    singularName: 'auth-provider', // kebab-case mandatory
    pluralName: 'auth-providers', // kebab-case mandatory
    displayName: 'AuthProvider',
    description: 'A regular content-type',
    kind: 'collectionType',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: true,
    },
    'content-type-builder': {
      visible: true,
    }
  },
  attributes: {
    provider: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false,
    },
    provider_owner: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false,
    },
    username: {
      type: 'string',
      min: 1,
      max: 50,
      configurable: false,
    },
    email: {
      type: 'email',
      min: 1,
      max: 50,
      configurable: false,
    },
    enable_as_first_step: {
      type: 'boolean',
      default: true,
      configurable: false,
    },
    enable_as_second_step: {
      type: 'boolean',
      default: true,
      configurable: false,
    },
  }
};
