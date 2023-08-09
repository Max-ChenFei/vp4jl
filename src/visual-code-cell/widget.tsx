import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { VPEditor, ISceneActions } from 'visual-programming-editor';

export class VPWidget extends ReactWidget {
  constructor(id: string, model: any) {
    super();
    this.id = id;
    this.node.style.width = '100%';
    this.node.style.height = '100%';
    this.node.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    this.node.addEventListener('focusout', function (e) {
      e.preventDefault();
      const nextFocusedElement = e.relatedTarget as HTMLElement;
      const isElementChild = this.contains(nextFocusedElement);
      const isMenu = nextFocusedElement?.classList[0].includes('Mui');
      if (nextFocusedElement && (isElementChild || isMenu)) {
        e.stopPropagation();
      }
    });
    // this._model = model;
    // this._model.vpContentChanged.connect(this.update, this);
  }

  // get model(): any {
  //   return this._model;
  // }
  setSceneActions(actions: ISceneActions | null): void {
    this._sceneActions = actions;
  }

  closeMenu(): void {
    this._sceneActions?.closeMenu();
  }

  get hasFocus(): boolean {
    return this._editor_activated;
  }

  focus(): void {
    if (!this._editor_activated) {
      this._editor_activated = true;

      this.update();
    }
  }

  blur(): void {
    if (this._editor_activated) {
      this._editor_activated = false;
      this.update();
    }
  }

  render(): JSX.Element {
    return (
      <VPEditor
        id={this.id}
        // content={this._model.vpContent}
        // onContentChange={this._model.setVpContent.bind(this._model)}
        activated={this._editor_activated}
        onSceneActionsInit={this.setSceneActions.bind(this)}
      />
    );
  }

  // private _model: any;
  private _editor_activated = false;
  private _sceneActions: any | null = null;
}

export function createVPWidget(id: string, model: any, host: HTMLElement): any {
  const editor = new VPWidget(id, model);
  host.style.height = '300px';
  window.requestAnimationFrame(() => {
    if (host.isConnected) {
      Widget.attach(editor, host);
    }
  });
  return editor;
}
