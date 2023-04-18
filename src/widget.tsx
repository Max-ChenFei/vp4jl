import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

/**
 * A visual programming widget that contains the main view of the DocumentWidget.
 */
export class VPWidget extends ReactWidget {
  context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  constructor(context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>) {
    super();
    this.context = context;
  }

  render(): JSX.Element {
    return (
      <div>
        <h1>Visual Programming for JupyterLab</h1>
        <p>VP4JL is a visual programming environment for JupyterLab.</p>
      </div>
    );
  }
}

/**
 * A DocumentWidge that represents the view for a fiel type
 */
export class VPDocWidget extends DocumentWidget<
  VPWidget,
  DocumentRegistry.ICodeModel
> {
  constructor(
    options: DocumentWidget.IOptions<VPWidget, DocumentRegistry.ICodeModel>
  ) {
    super(options);
    this.title.iconClass = 'jp-VPIcon';
    this.title.caption = 'Visual Programming';
    this.addClass('jp-VPWidget');
  }
}
