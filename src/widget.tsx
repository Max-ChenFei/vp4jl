import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { VPEditor, type SerializedGraph } from 'visual-programming-editor2';
import 'visual-programming-editor2/dist/style.css';
/**
 * A visual programming widget that contains the main view of the DocumentWidget.
 */
export class VPWidget extends ReactWidget {
  private _context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  private _content: SerializedGraph | undefined;
  constructor(context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>) {
    super();
    this._context = context;
    this._content = undefined;
    this._context.ready.then(() => {
      // this._context.model.value.changed.connect(this._onValueChanged, this);
      console.log(this._context.model.value.text);
      this._content = JSON.parse(this._context.model.value.text);
      this.update();
    });
  }

  render(): JSX.Element {
    return <VPEditor graph={this._content} />;
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
