const pluginPermissions = {

  // Providers
  readProviders: [{action: 'plugins::phone-auth.providers.read', subject: null}],
  updateProviders: [{action: 'plugins::phone-auth.providers.update', subject: null}],
};

export default pluginPermissions;
