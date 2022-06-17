import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import App from './containers/App'
import Initializer from './containers/Initializer'
import lifecycles from './lifecycles'
//import trads from './translations'
import PluginIcon from "./containers/Components/PluginIcon"

export default {
  register(app) {

    const pluginDescription =
      pluginPkg.strapi.description || pluginPkg.description
    const icon = pluginPkg.strapi.icon
    const name = pluginPkg.strapi.name

    const plugin = {
      blockerComponent: null,
      blockerComponentProps: {},
      description: pluginDescription,
      icon,
      id: pluginId,
      initializer: Initializer,
      injectedComponents: [],
      isReady: false,
      isRequired: pluginPkg.strapi.required || false,
      layout: null,
      lifecycles,
      mainComponent: App,
      name,
      preventComponentRendering: false,
    }
    const menu = {
      pluginsSectionLinks: [
        {
          destination: `/plugins/${pluginId}`,
          icon: PluginIcon,
          label: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: name,
          },
          name,
          permissions: [
            // Uncomment to set the permissions of the plugin here
            // {
            //   action: '', // the action name should be plugins::plugin-name.actionType
            //   subject: null,
            // },
          ],
        },
      ],
    }
    const pluginPermissions = {
      // This permission regards the main component (App) and is used to tell
      // If the plugin link should be displayed in the menu
      // And also if the plugin is accessible. This use case is found when a user types the url of the
      // plugin directly in the browser
      main: [{action: 'plugins::content-export-import.read', subject: null}],
    };

    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      //permissions: pluginPermissions.main,
      Component: async () => {
        const component = await import(/* webpackChunkName: "my-plugin-page" */ './containers/App');

        return component;
      },
    })
    // executes as soon as the plugin is loaded
    app.registerPlugin(plugin)
  },
  async registerTrads({locales}) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "[pluginId]-[request]" */ `./translations/${locale}.json`
          )
          .then(({default: data}) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
}
