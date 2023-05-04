import React from 'react';
import { ReactWidget, DOMUtils } from '@jupyterlab/apputils';
import { extensionIcon } from '@jupyterlab/ui-components';

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
    return <p style={{ textAlign: 'center' }}>Node Extension</p>;
  }
}
