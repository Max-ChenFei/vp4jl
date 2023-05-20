import React from 'react';
import { Session } from '@jupyterlab/services';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ISessionContext, ReactWidget } from '@jupyterlab/apputils';
import { VPEditor } from 'visual-programming-editor';
import 'visual-programming-editor/dist/style.css';
import { IVPContext } from './context';
import { IVPModel, IKernelspec } from './model';

export class VPMainAreaWidget extends ReactWidget {
  constructor(id: string, model: IVPModel) {
    super();
    this.id = id;
    this._model = model;
    this._model.vpContentChanged.connect(this.update, this);
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

  render(): JSX.Element {
    return (
      <VPEditor
        id={this.id}
        content={this._model.vpContent}
        onContentChange={this._model.setVpContent.bind(this._model)}
        activated={this._editor_activated}
      />
    );
  }

  private _model: IVPModel;
  private _editor_activated = false;
}

export class VPWidget extends DocumentWidget<VPMainAreaWidget, IVPModel> {
  constructor(id: string, context: IVPContext) {
    super({
      context,
      content: new VPMainAreaWidget(id, context.model)
    });
    this.title.iconClass = 'jp-VPIcon';
    this.title.caption = 'Visual Programming';
    this.addClass('jp-VPWidget');
    this.toolbar.addClass('jp-vp-toolbar');

    this.context.ready.then(this._onContextReady.bind(this));
    this.model.kernelSpecChanged.connect(this._changeKernel, this);
    this.sessionContext.kernelChanged.connect(this._setModelKernelSpec, this);
  }

  get model(): IVPModel {
    return this.context.model;
  }

  get sessionContext(): ISessionContext {
    return this.context.sessionContext;
  }

  private _onContextReady() {
    this.sessionContext.kernelPreference = {
      canStart: true,
      shouldStart: true,
      autoStartDefault: false,
      shutdownOnDispose: false
    };
  }

  private async _changeKernel(sender: any, newSpec: IKernelspec) {
    if (newSpec) {
      this.sessionContext.changeKernel(newSpec);
    }
  }

  private _setModelKernelSpec(
    sender: any,
    args: Session.ISessionConnection.IKernelChangedArgs
  ): void {
    void this.model.setKernelSpec(args.newValue);
  }
}
