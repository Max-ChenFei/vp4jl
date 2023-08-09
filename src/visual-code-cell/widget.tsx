import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import React from 'react';
import { VPEditor } from 'visual-programming-editor';

export class VPWidget extends ReactWidget {
  constructor(id: string, model: any) {
    super();
    this.id = id;
    this.node.style.width = '100%';
    this.node.style.height = '100%';
    // this._model = model;
    // this._model.vpContentChanged.connect(this.update, this);
  }

  // get model(): any {
  //   return this._model;
  // }

  // activate(): void {
  //   if (!this._editor_activated) {
  //     this._editor_activated = true;
  //     this.update();
  //   }
  // }

  // deactivate(): void {
  //   if (this._editor_activated) {
  //     this._editor_activated = false;
  //     this.update();
  //   }
  // }

  // private _updateToolbar() {
  //   // from toolbar-factory.tsx
  //   ['copy', 'paste', 'cut', 'duplicate', 'delete'].forEach(name => {
  //     this.model.toolbarItems[name].widget.update();
  //   });
  // }

  render(): JSX.Element {
    return (
      <VPEditor
        id={this.id}
        // content={this._model.vpContent}
        // onContentChange={this._model.setVpContent.bind(this._model)}
        // activated={this._editor_activated}
        // onSceneActionsInit={this._model.setVpActions.bind(this._model)}
        // onSelectionChange={this._updateToolbar.bind(this)}
      />
    );
  }

  // private _model: any;
  // private _editor_activated = false;
}

export function createVPWidget(id: string, model: any, host: HTMLElement): any {
  // const editor = document.createElement('textarea');
  // editor.style.height = '100px';
  // editor.style.width = '100px';
  // host.appendChild(editor);
  const editor = new VPWidget(id, model);
  host.style.height = '300px';
  // host.style.width = '100px';

  window.requestAnimationFrame(() => {
    if (host.isConnected) {
      Widget.attach(editor, host);
    }
  });
  return editor;
}
