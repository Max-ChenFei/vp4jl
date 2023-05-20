import { ISharedFile } from '@jupyter/ydoc';
import { Kernel } from '@jupyterlab/services';
import { ISignal, Signal } from '@lumino/signaling';
import { DocumentRegistry, DocumentModel } from '@jupyterlab/docregistry';
import { isSameContent } from './utils';
import { SerializedGraph } from 'visual-programming-editor';

export interface IVPModel extends DocumentRegistry.ICodeModel {
  kernelSpec: Partial<Kernel.IModel> | undefined;
  vpContent: SerializedGraph | null;
  setKernelSpec(kernel: Kernel.IKernelConnection | null): Promise<void>;
  setVpContent(vpContent: SerializedGraph | null | string): void;
  kernelSpecChanged: ISignal<this, IKernelspec>;
  vpContentChanged: ISignal<this, void>;
}

export type IKernelspec = Partial<Kernel.IModel> | undefined;

export class VPModel extends DocumentModel implements IVPModel {
  constructor(options?: DocumentRegistry.IModelOptions<ISharedFile>) {
    super(options);
    this.contentChanged.connect(this._setProperties.bind(this));
  }

  private _setProperties() {
    const model = JSON.parse(this.toString());
    this.kernelSpec = model.kernelSpec;
    this.vpContent = model.vpContent;
  }

  private _setModelContent() {
    const content = JSON.stringify({
      vpContent: this.vpContent,
      kernelSpec: this.kernelSpec
    });
    if (this.toString() !== content) {
      this.fromString(content);
    }
  }

  async setKernelSpec(kernel: Kernel.IKernelConnection | null) {
    if (!kernel) {
      return;
    }
    const spec = await kernel.spec;
    if (this.isDisposed) {
      return;
    }
    const newSpec = {
      name: kernel.name,
      display_name: spec?.display_name,
      language: spec?.language
    };
    if (!isSameContent(this.kernelSpec, newSpec)) {
      this.kernelSpec = newSpec;
    }
  }

  set kernelSpec(kernelSpec: Partial<Kernel.IModel> | undefined) {
    if (!isSameContent(this.kernelSpec, kernelSpec ?? {})) {
      this._kernelSpec = kernelSpec;
      this._kernelSpecChanged.emit(this._kernelSpec);
      this._setModelContent();
    }
  }

  get kernelSpec(): Partial<Kernel.IModel> | undefined {
    return this._kernelSpec;
  }

  setVpContent(vpContent: SerializedGraph | null | string) {
    this.vpContent =
      typeof vpContent === 'string' ? JSON.parse(vpContent) : vpContent;
  }

  set vpContent(vpContent: SerializedGraph | null) {
    if (!isSameContent(this._vpContent, vpContent)) {
      this._vpContent = vpContent;
      this._vpContentChanged.emit();
      this._setModelContent();
    }
  }

  get vpContent(): SerializedGraph | null {
    return this._vpContent;
  }

  get kernelSpecChanged(): ISignal<this, IKernelspec> {
    return this._kernelSpecChanged;
  }

  get vpContentChanged(): ISignal<this, void> {
    return this._vpContentChanged;
  }

  private _kernelSpec: Partial<Kernel.IModel> | undefined = {};
  private _vpContent: SerializedGraph | null = null;
  private _kernelSpecChanged = new Signal<this, IKernelspec>(this);
  private _vpContentChanged = new Signal<this, void>(this);
}
