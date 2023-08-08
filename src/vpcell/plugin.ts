import { IToolbarWidgetRegistry } from '@jupyterlab/apputils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookWidgetFactory, NotebookPanel } from '@jupyterlab/notebook';
import createCellTypeItem from './cell-type-item';

const vp4jlVpCell: JupyterFrontEndPlugin<void> = {
  id: 'vp4jlVpCell',
  autoStart: true,
  requires: [IToolbarWidgetRegistry, INotebookWidgetFactory],
  activate: activateVp4jlVpCell
};

export default vp4jlVpCell;

function activateVp4jlVpCell(
  app: JupyterFrontEnd,
  toolbarRegistry: IToolbarWidgetRegistry,
  notebookFactory: any
) {
  // https://github.com/jupyterlab/jupyterlab/blob/a0d07f17e85acd967e722a5c5ed54529a361e5cf/packages/notebook-extension/src/index.ts#L321
  const FACTORY = 'Notebook';
  toolbarRegistry.addFactory<NotebookPanel>(FACTORY, 'cellType', panel =>
    createCellTypeItem(panel)
  );
}
