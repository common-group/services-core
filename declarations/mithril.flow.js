type mNode = {tag: string, attrs: Object, children: Array<MithrilNode>};
type mConfig = (element: HTMLElement, isInitialized: boolean): void;
type Component = {controller: ?(args: ?Object) => Object, view: (args: ?Object, controller: ?Object) => mNode)};

declare module 'mithril' {
  declare module.exports: any;
}
