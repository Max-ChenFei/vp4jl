import { IToolbarWidgetRegistry } from '@jupyterlab/apputils';
import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookWidgetFactory, NotebookPanel } from '@jupyterlab/notebook';
import createCellTypeItem from './cell-type-item';
import { ContentFactory } from './content-factory';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { VPNotebook } from './notebook';

const vp4jlVpCell: JupyterFrontEndPlugin<void> = {
  id: 'vp4jlVpCell',
  autoStart: true,
  requires: [IToolbarWidgetRegistry, IEditorServices, INotebookWidgetFactory],
  activate: activateVp4jlVpCell
};

function activateVp4jlVpCell(
  app: JupyterFrontEnd,
  toolbarRegistry: IToolbarWidgetRegistry,
  editorServices: IEditorServices,
  notebookWidgetFactory: any
) {
  const FACTORY = 'Notebook';
  toolbarRegistry.addFactory<NotebookPanel>(FACTORY, 'cellType', panel =>
    createCellTypeItem(panel)
  );

  const editorFactory = editorServices.factoryService.newInlineEditor;
  notebookWidgetFactory.contentFactory = new ContentFactory({
    editorFactory
  });
}

const vp4jlCloseMenuWhenCloseTab: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:CloseMenuWhenCloseTab',
  autoStart: true,
  requires: [ILabShell],
  activate: activateVp4jlCloseMenuWhenCloseTab
};

function activateVp4jlCloseMenuWhenCloseTab(
  app: JupyterFrontEnd,
  labShell: ILabShell
) {
  // close the context menu when switch the tab
  labShell.currentChanged.connect((_, args) => {
    const content = (args.oldValue as any).content;
    if (content instanceof VPNotebook) {
      content.closeMenus();
    }
  });
}

export default [vp4jlVpCell, vp4jlCloseMenuWhenCloseTab];
