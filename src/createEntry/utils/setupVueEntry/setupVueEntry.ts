import type { App, Plugin } from 'vue';
import type { VueEntryNormalizedOptions, PluginDescriptor } from '../../types';

/**
 * Applies Vue entry plugins, components, and directives to an app instance.
 *
 * Plugin descriptors can pass one or more options to `app.use`. Registered
 * components and directives are installed globally on the entry app.
 *
 * @param app - Vue app instance to configure.
 * @param options - Normalized Vue entry options.
 */
export function setupVueEntry(app: App<any>, options: VueEntryNormalizedOptions): void {
  const { use, register } = options;

  use.forEach((_plugin: Plugin | PluginDescriptor) => {
    const plugin = (_plugin as PluginDescriptor).plugin || _plugin as Plugin;
    let options: any[] = [];
    
    if ((_plugin as PluginDescriptor).options) {
      options = Array.isArray((_plugin as PluginDescriptor).options) ?
        (_plugin as PluginDescriptor).options :
        [ (_plugin as PluginDescriptor).options ];
    }

    app.use(plugin, ...options);
  });
  
  const { component, directive } = register;

  Object.entries(component).forEach(([name, component]) => {
    app.component(name, component);
  });

  Object.entries(directive).forEach(([name, directive]) => {
    app.directive(name, directive);
  });
}
