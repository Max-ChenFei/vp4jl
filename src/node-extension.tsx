import React from 'react';
import { ReactWidget, DOMUtils } from '@jupyterlab/apputils';
import { extensionIcon } from '@jupyterlab/ui-components';
import { requestAPI } from './handler';
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

  private uninstallNodeExtension(name: string) {
    requestAPI<any>('node_extension_manager', {
      method: 'DELETE',
      body: JSON.stringify(name)
    })
      .then(data => {
        if (data.status === 'ok') {
          nodeConfigRegistry.removeNodeConfig(name);
          this.update();
        }
      })
      .catch(reason => {
        console.error(
          `The node extension manager appears to be missing.\n${reason}`
        );
      });
  }

  private enableNodeExtension(name: string, enable: boolean) {
    requestAPI<any>('node_extension_manager', {
      method: 'POST',
      body: JSON.stringify({ name: name, enable: enable })
    })
      .then(data => {
        if (data.status === 'ok') {
          nodeConfigRegistry.enableNodeConfig(name, enable);
          this.update();
        }
      })
      .catch(reason => {
        console.error(
          `The node extension manager appears to be missing.\n${reason}`
        );
      });
  }

  render(): JSX.Element {
    return (
      <>
        <NodeLibraryList
          title="INSTALLED"
          nodeExtensions={{ ...nodeConfigRegistry.getAllNodeConfigs() }}
          onUninstall={(name: string) => {
            this.uninstallNodeExtension(name);
          }}
          onDisable={(name: string) => {
            this.enableNodeExtension(name, false);
          }}
          onEnable={(name: string) => {
            this.enableNodeExtension(name, true);
          }}
        />
      </>
    );
  }
}
