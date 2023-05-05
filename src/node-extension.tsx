import React from 'react';
import { ReactWidget, DOMUtils } from '@jupyterlab/apputils';
import { extensionIcon } from '@jupyterlab/ui-components';
import {
  NodeLibraryList,
  nodeConfigRegistry
} from 'visual-programming-editor2';

export class NodeExtension extends ReactWidget {
  constructor() {
    super();
    this.id = DOMUtils.createDomID();
    this.node.style.background = 'var(--jp-layout-color1)';
    this.title.icon = extensionIcon;
    this.title.caption = 'Node Extension Manager';
    this.addClass('jp-NodeExtension');
    this.addClass('lm-StackedPanel-child');
    this.addClass('p-StackedPanel-child');
  }

  render(): JSX.Element {
    return (
      <>
        <NodeLibraryList
          title="INSTALLED"
          nodeExtensions={nodeConfigRegistry.getAllNodeConfigs()}
          onUninstall={() => {
            console.log('uninstall');
            nodeConfigRegistry.removeNodeConfig('package1');
            this.update();
          }}
          onDisable={() => {
            console.log('disable');
            nodeConfigRegistry.disableNodeConfig('package1');
            this.update();
          }}
          onEnable={() => {
            console.log('enable');
            nodeConfigRegistry.enableNodeConfig('package1');
            this.update();
          }}
        />
      </>
    );
  }
}
