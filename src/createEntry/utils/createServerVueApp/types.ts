import type { Component, App } from 'vue';

export type CreateServerApp = (rootComponent: Component, rootProps?: Record<string, any>) => App;
