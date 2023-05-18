import React from 'react';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { extensionIcon } from '@jupyterlab/ui-components';
import { ReactWidget, DOMUtils } from '@jupyterlab/apputils';
import {
  NodeLibraryList,
  nodeConfigRegistry,
  Progress
} from 'visual-programming-editor';
import { requestAPI } from './handler';
import { requestToken } from './request-token';

function NodeExtensionWidget({
  fetching,
  uninstallNodeExtension,
  enableNodeExtension,
  url
}: {
  fetching: boolean;
  uninstallNodeExtension: (name: string) => void;
  enableNodeExtension: (name: string, enable: boolean) => void;
  url?: string;
}): JSX.Element {
  return (
    <>
      <Progress enable={fetching} />
      <NodeLibraryList
        title="INSTALLED"
        nodeExtensions={{ ...nodeConfigRegistry.getAllNodeConfigs() }}
        onUninstall={(name: string) => {
          uninstallNodeExtension(name);
        }}
        onDisable={(name: string) => {
          enableNodeExtension(name, false);
        }}
        onEnable={(name: string) => {
          enableNodeExtension(name, true);
        }}
        url={url}
        tokens={requestToken()}
      />
    </>
  );
}
export class NodeExtension extends ReactWidget {
  private fetching = false;
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
    this.fetching = true;
    this.update();
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
      })
      .finally(() => {
        this.fetching = false;
        this.update();
      });
  }

  private enableNodeExtension(name: string, enable: boolean) {
    this.fetching = true;
    this.update();
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
      })
      .finally(() => {
        this.fetching = false;
        this.update();
      });
  } // Make request to Jupyter API
  settings = ServerConnection.makeSettings();
  requestUrl = URLExt.join(
    this.settings.baseUrl,
    'vp4jl', // API Namespace
    'node_extension_manager'
  );

  render(): JSX.Element {
    return (
      <NodeExtensionWidget
        fetching={this.fetching}
        uninstallNodeExtension={this.uninstallNodeExtension.bind(this)}
        enableNodeExtension={this.enableNodeExtension.bind(this)}
        url={this.requestUrl}
      />
    );
  }
}
