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
import { ServiceManager } from '@jupyterlab/services';
import { Message } from '@lumino/messaging';
/**
 * A visual programming widget that contains the main view of the DocumentWidget.
 */
export class VPWidget extends ReactWidget {
  private _id: string;
  private _context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>;
  private _content: SerializedGraph | undefined;
  private _editor_activated = false;
  private isSameAsContent(newContent: string): boolean {
    return (
      JSON.stringify(JSON.parse(this._context.model.value.text)) === newContent
    );
  }
  constructor(
    id: string,
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ) {
    super();
    this._id = id;
    this._content = undefined;
    this._context = context;
    this._context.ready.then(() => {
      this._content = JSON.parse(this._context.model.value.text);
      this.update();
      this._context.model.contentChanged.connect(() => {
        // the change comes from the editor or the command from the menu like
        if (!this.isSameAsContent(JSON.stringify(this._content))) {
          this._content = JSON.parse(this._context.model.value.text);
          this.update();
        }
      });
    });
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

  private _onContentChanged(newContent: string) {
    if (!this.isSameAsContent(newContent)) {
      this._content = JSON.parse(newContent);
      this._context.model.value.text = newContent;
    }
  }

  render(): JSX.Element {
    return (
      <VPEditor
        id={this._id}
        content={this._content}
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

    void this._sessionContext
      .initialize()
      .then(async value => {
        if (value) {
          await sessionContextDialogs.selectKernel(this._sessionContext);
          await this._sessionContext.session?.kernel?.info;
        }
      })
      .catch(reason => {
        console.error(
          `Failed to initialize the session in Visual Programming Panel.\n${reason}`
        );
      });
  }
  get session(): ISessionContext {
    return this._sessionContext;
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
