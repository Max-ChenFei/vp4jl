import React from 'react';
import { Kernel, Session } from '@jupyterlab/services';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ISessionContext, ReactWidget } from '@jupyterlab/apputils';
import { VPEditor, type SerializedGraph } from 'visual-programming-editor';
import 'visual-programming-editor/dist/style.css';
import { isSameContent } from './utils';
import { IVPContext } from './context';
import { IVPModel } from './model';

export class VPMainAreaWidget extends ReactWidget {
  private _id: string;
  private _context: IVPContext;
  private _vpContent: SerializedGraph | null;
  private _modelMetadata: { [key: string]: any } = {};
  private _editor_activated = false;

  constructor(id: string, context: IVPContext) {
    super();
    this._id = id;
    this._vpContent = null;
    this._context = context;
    this.model.contentChanged.connect(this._setContent.bind(this));
    this.sessionContext.kernelChanged.connect(this._onKernelChanged, this);
    this._context.ready.then(this._onContextReady.bind(this));
  }

  get model(): IVPModel {
    return this._context.model;
  }

  get sessionContext(): ISessionContext {
    return this._context.sessionContext;
  }

  private async _setKernelSpec(newSpec?: any) {
    if (newSpec) {
      this.sessionContext.changeKernel(newSpec);
    }
  }

  private _setContent() {
    const model = JSON.parse(this.model.toString());
    if (!isSameContent(this._modelMetadata, model.metadata ?? {})) {
      this._setKernelSpec(model.metadata?.kernelspec);
      this._modelMetadata = model.metadata;
    }
    if (!isSameContent(this._vpContent, model.vpContent)) {
      this._vpContent = model.vpContent;
      this.update();
    }
  }

  private _updateModelString({
    metadata,
    vpContent
  }: {
    metadata?: { [key: string]: any };
    vpContent?: SerializedGraph;
  }): void {
    this.model.fromString(
      JSON.stringify({
        vpContent: vpContent ?? this._vpContent,
        metadata: metadata ?? this._modelMetadata
      })
    );
  }

  private _syncVPContent(newContent: string) {
    // when the context is ready amd get the value from the disk,
    // the funciton will be called, so unnecessary update will be avoided.
    const vpContent = JSON.parse(newContent);
    if (isSameContent(this._vpContent, vpContent)) {
      return;
    }
    this._vpContent = vpContent;
    this._updateModelString({ vpContent });
  }

  private setMetadata(key: string, value: any) {
    this._updateModelString({
      metadata: { ...this._modelMetadata, [key]: value }
    });
  }

  private _onKernelChanged(
    sender: any,
    args: Session.ISessionConnection.IKernelChangedArgs
  ): void {
    if (!this.model || !args.newValue) {
      return;
    }
    const { newValue } = args;
    void this._updatekernelSpec(newValue);
  }

  private async _updatekernelSpec(
    kernel: Kernel.IKernelConnection
  ): Promise<void> {
    const spec = await kernel.spec;
    if (this.isDisposed) {
      return;
    }
    const newSpec = {
      name: kernel.name,
      display_name: spec?.display_name,
      language: spec?.language
    };
    if (!isSameContent(this._modelMetadata.kernelspec, newSpec)) {
      this._modelMetadata.kernelspec = newSpec;
      this.setMetadata('kernelspec', newSpec);
    }
  }

  private _onContextReady() {
    this._context.sessionContext.kernelPreference = {
      canStart: true,
      shouldStart: true,
      autoStartDefault: false,
      shutdownOnDispose: false
    };
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
        id={this._id}
        content={this._vpContent}
        onContentChange={(newContent: string) =>
          this._syncVPContent(newContent)
        }
        activated={this._editor_activated}
      />
    );
  }
}

export class VPWidget extends DocumentWidget<VPMainAreaWidget, IVPModel> {
  constructor(id: string, context: IVPContext) {
    super({
      context,
      content: new VPMainAreaWidget(id, context)
    });
    this.title.iconClass = 'jp-VPIcon';
    this.title.caption = 'Visual Programming';
    this.addClass('jp-VPWidget');
    this.toolbar.addClass('jp-vp-toolbar');
  }

  get sessionContext(): ISessionContext {
    return this.context.sessionContext;
  }
}
