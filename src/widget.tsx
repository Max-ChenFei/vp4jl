import React from 'react';
import {
  ISessionContext,
  ReactWidget,
  SessionContext,
  sessionContextDialogs
} from '@jupyterlab/apputils';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { VPEditor, type SerializedGraph } from 'visual-programming-editor2';
import 'visual-programming-editor2/dist/style.css';
import {
  Kernel,
  KernelMessage,
  ServiceManager,
  Session
} from '@jupyterlab/services';
import { Message } from '@lumino/messaging';

function isSameContent(
  a: string | SerializedGraph | undefined,
  b: string | SerializedGraph | undefined
): boolean {
  if (a === undefined && b === undefined) {
    return false;
  }
  const aContent =
    typeof a !== 'string'
      ? JSON.stringify(a as SerializedGraph)
      : JSON.stringify(JSON.parse(a) as SerializedGraph);
  const bContent =
    typeof b !== 'string'
      ? JSON.stringify(b as SerializedGraph)
      : JSON.stringify(JSON.parse(b) as SerializedGraph);
  return aContent === bContent;
}

/**
 * A visual programming widget that contains the main view of the DocumentWidget.
 */
export class VPWidget extends ReactWidget {
  private _sessionContext!: ISessionContext;
  private _id: string;
  private _context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  private _graphContent: SerializedGraph | undefined;
  private _editor_activated = false;
  private _modelMetadata: { [key: string]: any } = {};

  constructor(
    id: string,
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ) {
    super();
    this._id = id;
    this._graphContent = undefined;
    this._context = context;
    this._context.ready.then(() => {
      this._setContent();
      this._context.model.contentChanged.connect(() => {
        // the change of model.value.text comes from the editor or the command from the menu like "reload from disk"
        this._setContent();
      });
    });
  }

  private _setContent() {
    if (!isSameContent(this._graphContent, this._context.model.value.text)) {
      const model = JSON.parse(this._context.model.value.text);
      this._graphContent = model as SerializedGraph;
      this._modelMetadata = model.metadata || {};
      this.update();
    }
  }

  private _setModelText(): void {
    this._context.model.value.text = JSON.stringify({
      ...this._graphContent,
      metadata: this._modelMetadata
    });
  }

  private _onContentChanged(newContent: string) {
    if (!isSameContent(newContent, this._graphContent)) {
      this._graphContent = JSON.parse(newContent);
      this._setModelText();
    }
  }

  set sessionContext(sessionContext: ISessionContext) {
    this._sessionContext = sessionContext;
    this._sessionContext.kernelChanged.connect(this._onKernelChanged, this);
  }

  get model(): DocumentRegistry.ICodeModel | null {
    return this._context.model;
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

  private setMetadata(key: string, value: any) {
    this._modelMetadata[key] = value;
    this._setModelText();
  }

  private _onKernelChanged(
    sender: any,
    args: Session.ISessionConnection.IKernelChangedArgs
  ): void {
    if (!this.model || !args.newValue) {
      return;
    }
    const { newValue } = args;
    void newValue.info.then(info => {
      if (
        this.model &&
        this._context.sessionContext.session?.kernel === newValue
      ) {
        this._updateLanguage(info.language_info);
      }
    });
    void this._updatekernelSpec(newValue);
  }

  private _updateLanguage(language: KernelMessage.ILanguageInfo): void {
    this.setMetadata('language_info', language);
  }

  private async _updatekernelSpec(
    kernel: Kernel.IKernelConnection
  ): Promise<void> {
    const spec = await kernel.spec;
    if (this.isDisposed) {
      return;
    }
    this.setMetadata('kernelspec', {
      name: kernel.name,
      display_name: spec?.display_name,
      language: spec?.language
    });
  }

  render(): JSX.Element {
    return (
      <VPEditor
        id={this._id}
        content={this._graphContent}
        onContentChange={newContent => this._onContentChanged(newContent)}
        activated={this._editor_activated}
      />
    );
  }
}

/**
 * A Document Widget that represents the view for a file type
 */
export class VPDocWidget extends DocumentWidget<
  VPWidget,
  DocumentRegistry.ICodeModel
> {
  private _sessionContext: SessionContext;
  constructor(
    options: DocumentWidget.IOptions<VPWidget, DocumentRegistry.ICodeModel>,
    serviceManager: ServiceManager.IManager
  ) {
    super(options);
    this.title.iconClass = 'jp-VPIcon';
    this.title.caption = 'Visual Programming';
    this.addClass('jp-VPWidget');
    this._sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: options.context.sessionContext.name
    });
    // so the vpwidget can get the sessionContext and bind slot to the kernelChanged signal
    options.content.sessionContext = this._sessionContext;
    void this._sessionContext
      .initialize()
      .then(async value => {
        if (!value) {
          return;
        }
        options.context.ready.then(async () => {
          const content = JSON.parse(options.context.model.value.text);
          console.log(content);
          if (content.metadata?.kernelspec) {
            this._sessionContext.changeKernel(content.metadata.kernelspec);
          } else {
            console.log('No kernelspec in the metadata');
            await sessionContextDialogs.selectKernel(this._sessionContext);
          }
        });
      })
      .catch(reason => {
        console.error(
          `Failed to initialize the session in Visual Programming Panel.\n${reason}`
        );
      });
  }

  dispose(): void {
    this._sessionContext.dispose();
    super.dispose();
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.dispose();
  }
}
