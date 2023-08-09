import React from 'react';
// import { CodeEditor } from '@jupyterlab/codeeditor';
import { ReactWidget } from '@jupyterlab/ui-components';
// import { ISignal, Signal } from '@lumino/signaling';
import { UUID } from '@lumino/coreutils';

import { VPEditor } from 'visual-programming-editor';
import { Widget } from '@lumino/widgets';
// import { IPosition } from '@jupyterlab/lsp';

export class VisualPanel extends ReactWidget {
  constructor(id: string, model: any) {
    super();
    this.id = id;
    this._model = model;
    this._model.vpContentChanged.connect(this.update, this);
  }

  get model(): any {
    return this._model;
  }

  activate(): void {
    if (!this._editor_activated) {
      this._editor_activated = true;
      this.update();
    }
  }

  deactivate(): void {
    if (this._editor_activated) {
      this._editor_activated = false;
      this.update();
    }
  }

  private _updateToolbar() {
    // from toolbar-factory.tsx
    ['copy', 'paste', 'cut', 'duplicate', 'delete'].forEach(name => {
      this.model.toolbarItems[name].widget.update();
    });
  }

  render(): JSX.Element {
    return (
      <VPEditor
        id={this.id}
        content={this._model.vpContent}
        onContentChange={this._model.setVpContent.bind(this._model)}
        activated={this._editor_activated}
        onSceneActionsInit={this._model.setVpActions.bind(this._model)}
        onSelectionChange={this._updateToolbar.bind(this)}
      />
    );
  }

  private _model: any;
  private _editor_activated = false;
}

// export class VisualCodeEditor implements CodeEditor.IEditor {
export class VisualCodeEditor {
  private _uuid = '';

  /**
   * Brings browser focus to this editor text.
   */
  focus(): void {
    return undefined;
  }
  /**
   * Test whether the editor has keyboard focus.
   */
  hasFocus(): boolean {
    return false;
  }
  /**
   * Explicitly blur the editor.
   */
  blur(): void {
    return undefined;
  }

  // constructor(options: CodeEditor.IOptions) {
  constructor(options: { host: HTMLElement }) {
    // host.addEventListener('focus', this, true);
    // host.addEventListener('blur', this, true);
    // host.addEventListener('scroll', this, true);

    this._uuid = UUID.uuid4();

    // this.model = options.model;

    // Default keydown handler - it will have low priority
    // const onKeyDown = EditorView.domEventHandlers({
    //   keydown: (event: KeyboardEvent, view: EditorView) => {
    //     return this.onKeydown(event);
    //   }
    // });

    // const updateListener = EditorView.updateListener.of(
    //   (update: ViewUpdate) => {
    //     this._onDocChanged(update);
    //   }
    // );

    // this._editor = Private.createEditor(
    //   host,
    //   this._configurator,
    //   [
    //     // We need to set the order to high, otherwise the keybinding for ArrowUp/ArrowDown
    //     // will process the event shunting our edge detection code.
    //     Prec.high(onKeyDown),
    //     updateListener,
    //     // Initialize with empty extension
    //     this._language.of([]),
    //     ...(options.extensions ?? [])
    //   ],
    //   model.sharedModel.source
    // );

    // this._onMimeTypeChanged();
    // this._onCursorActivity();

    // this._configurator.configChanged.connect(this.onConfigChanged, this);
    // model.mimeTypeChanged.connect(this._onMimeTypeChanged, this);
    // this.lineCount = 0;
    // this.charWidth = 0;
    // this.lineHeight = 0;
    this.host = options.host;
    this.host.classList.add('jp-Editor');

    Widget.attach(new VisualPanel(this._uuid, undefined), this.host);

    // edgeRequested = new Signal<this, CodeEditor.EdgeLocation>(this);
  }
  // edgeRequested: ISignal<this, CodeEditor.EdgeLocation>;

  host: HTMLElement;
  // model: CodeEditor.IModel;
}

export const VisualCodeEditorFactory = (
  host: HTMLElement
): // options: CodeEditor.IOptions
// ): CodeEditor.IEditor => {
any => {
  // options.host.dataset.type = 'inline';
  // return new VisualCodeEditor({
  //   ...options,
  //   config: { ...(options.config || {}) },
  //   inline: true
  // });
  return new VisualCodeEditor({
    host: host
  });
};
