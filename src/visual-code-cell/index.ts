import { IToolbarWidgetRegistry } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookWidgetFactory, NotebookPanel } from '@jupyterlab/notebook';
import createCellTypeItem from './cell-type-item';
import { ContentFactory } from './content-factory';
import { IEditorServices } from '@jupyterlab/codeeditor';

export const vp4jlVpCell: JupyterFrontEndPlugin<void> = {
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
