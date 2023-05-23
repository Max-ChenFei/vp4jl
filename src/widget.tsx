import React from 'react';
import { SplitPanel } from '@lumino/widgets';
import { Session } from '@jupyterlab/services';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ISessionContext, ReactWidget } from '@jupyterlab/apputils';
import { OutputArea, OutputAreaModel } from '@jupyterlab/outputarea';
import { VPEditor } from 'visual-programming-editor';
import 'visual-programming-editor/dist/style.css';
import { IVPContext } from './context';
import { IVPModel, IKernelspec } from './model';

export class VPEditorWidget extends ReactWidget {
  constructor(id: string, model: IVPModel) {
    super();
    this.id = id;
    this._model = model;
    this._model.vpContentChanged.connect(this.update, this);
  }

  get model(): IVPModel {
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
      console.log(this.model.toolbarItems[name]);
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

  private _model: IVPModel;
  private _editor_activated = false;
}

export class VPMainAreaPanel extends SplitPanel {
  constructor(id: string, model: IVPModel, sessionContext: ISessionContext) {
    super({ orientation: 'vertical', spacing: 1 });
    this.id = id + 'panel';
    this._sessionContext = sessionContext;
    this.addClass('jp-vp-main-area-panel');
    this._vpEditor = new VPEditorWidget(id, model);
    this.addWidget(this._vpEditor);
    this._outputArea = new OutputArea({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rendermime: model.rendermime!,
      model: new OutputAreaModel()
    });
    this.addWidget(this._outputArea);
    this.setRelativeSizes([4, 1]);
  }

  activate(): void {
    if (this._vpEditor) {
      this._vpEditor.activate();
    }
  }

  deactivate(): void {
    if (this._vpEditor) {
      this._vpEditor.deactivate();
    }
  }
  execute(): void {
    // Todo: use code from the vpContent
    const code = `
import matplotlib.pyplot as plt

fig, ax = plt.subplots()

fruits = ['apple', 'blueberry', 'cherry', 'orange']
counts = [40, 100, 30, 55]
bar_labels = ['red', 'blue', '_red', 'orange']
bar_colors = ['tab:red', 'tab:blue', 'tab:red', 'tab:orange']

ax.bar(fruits, counts, label=bar_labels, color=bar_colors)

ax.set_ylabel('fruit supply')
ax.set_title('Fruit supply by kind and color')
ax.legend(title='Fruit color')

plt.show()
print("5+5=",5+5)
print(a)` as string;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    OutputArea.execute(code, this._outputArea, this.sessionContext!).catch(
      reason => {
        console.error(reason);
        this._outputArea.model.clear();
        this._outputArea.model.add({
          output_type: 'error',
          ename: 'Error',
          evalue: reason.message,
          traceback: []
        });
        return;
      }
    );
  }

  get sessionContext(): ISessionContext | undefined {
    return this._sessionContext;
  }

  private _vpEditor: VPEditorWidget;
  private _outputArea: OutputArea;
  private _sessionContext: ISessionContext | undefined;
}

export class VPWidget extends DocumentWidget<VPMainAreaPanel, IVPModel> {
  constructor(id: string, context: IVPContext) {
    super({
      context,
      content: new VPMainAreaPanel(id, context.model, context.sessionContext)
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

  public execute(): void {
    this.content.execute();
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
