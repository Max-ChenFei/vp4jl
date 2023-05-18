import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  IFileBrowserFactory,
  IDefaultFileBrowser
} from '@jupyterlab/filebrowser';
import { ILauncher } from '@jupyterlab/launcher';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ICommandPalette } from '@jupyterlab/apputils';
import { VPModelFactory } from './model-factory';
import { VPWidgetFactory } from './widget-factory';
import { requestAPI } from './handler';
import { VPDocWidget } from './widget';
import { NodeExtension } from './node-extension';
import { vp4jlIDs as gVP4jlIDs } from './namepace';
import { IVPTracker, VPTracker, IVPTrackerToken } from './tracker';
import { LoadPackageToRegistry } from 'visual-programming-editor';

const vp4jl: JupyterFrontEndPlugin<IVPTracker> = {
  id: 'vp4jl:plugin',
  autoStart: true,
  provides: IVPTrackerToken,
  activate: activateVp4jl
};

const vp4jlMenu: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:Menu',
  autoStart: true,
  requires: [IDefaultFileBrowser, IFileBrowserFactory, IMainMenu],
  optional: [ILauncher, ICommandPalette],
  activate: activateVp4jlMenu
};

const vp4jlRestorer: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:Restorer',
  autoStart: true,
  optional: [ILayoutRestorer, IVPTrackerToken],
  activate: activateVp4jlRestorer
};

const vp4jlNodeExtension: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:NodeExtension',
  autoStart: true,
  optional: [ILayoutRestorer],
  activate: activateVp4jlNodeExtension
};

const vp4jlFixContextMenuClose: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:FixContextMenuClose',
  autoStart: true,
  requires: [ILabShell],
  activate: activateVp4jlFixContextMenuClose
};

const plugins: JupyterFrontEndPlugin<any>[] = [
  vp4jl,
  vp4jlMenu,
  vp4jlRestorer,
  vp4jlNodeExtension,
  vp4jlFixContextMenuClose
];
export default plugins;

function activateVp4jl(app: JupyterFrontEnd): IVPTracker {
  const vp4jlIDs = gVP4jlIDs;

  const tracker = new VPTracker({
    namespace: vp4jlIDs.trackerNamespace
  });

  const widgetFactory = new VPWidgetFactory({
    name: vp4jlIDs.widgetFactory,
    modelName: vp4jlIDs.modelFactory,
    fileTypes: [vp4jlIDs.fileType],
    defaultFor: [vp4jlIDs.fileType]
  });
  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    tracker.add(widget);
  });

  app.docRegistry.addWidgetFactory(widgetFactory);
  app.docRegistry.addModelFactory(new VPModelFactory());
  app.docRegistry.addFileType({
    name: vp4jlIDs.fileType,
    displayName: 'VP File',
    mimeTypes: ['text/json', 'application/json'],
    extensions: [vp4jlIDs.fileExtension],
    fileFormat: 'text',
    contentType: 'file'
  });
  return tracker;
}

function activateVp4jlMenu(
  app: JupyterFrontEnd,
  defaultFileBrowser: IDefaultFileBrowser,
  browserFactory: IFileBrowserFactory,
  mainMenu: IMainMenu,
  launcher: ILauncher | null,
  palette: ICommandPalette | null
) {
  const vp4jlIDs = gVP4jlIDs;
  app.commands.addCommand(vp4jlIDs.createNew, {
    label: args =>
      args['isPalette']
        ? vp4jlIDs.createNewLabelInPalette
        : args['isContextMenu']
        ? vp4jlIDs.createNewLabelInContextMenu
        : vp4jlIDs.createNewLabelInFileMenu,
    caption: vp4jlIDs.caption,
    execute: async args => {
      const cwd =
        args['cwd'] ||
        browserFactory.tracker.currentWidget?.model.path ||
        defaultFileBrowser.model.path;
      const model = await app.commands.execute('docmanager:new-untitled', {
        path: cwd,
        contentType: 'file',
        fileFormat: 'text',
        ext: vp4jlIDs.fileExtension,
        type: 'file'
      });
      return app.commands.execute('docmanager:open', {
        path: model.path,
        factory: vp4jlIDs.widgetFactory
      });
    }
  });

  mainMenu.fileMenu.newMenu.addGroup([{ command: vp4jlIDs.createNew }], 30);

  launcher?.add({
    command: vp4jlIDs.createNew,
    category: vp4jlIDs.commandCategory,
    rank: 0
  });

  palette?.addItem({
    command: vp4jlIDs.createNew,
    category: vp4jlIDs.commandCategory,
    args: { isPalette: true }
  });

  app.contextMenu.addItem({
    command: vp4jlIDs.createNew,
    selector: '.jp-DirListing-content',
    rank: 53,
    args: {
      isContextMenu: true
    }
  });
}

function activateVp4jlRestorer(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer | null,
  tracker: IVPTracker | null
) {
  const vp4jlIDs = gVP4jlIDs;
  if (restorer && tracker) {
    restorer.restore(tracker, {
      command: 'docmanager:open',
      args: widget => ({
        path: widget.context.path,
        factory: vp4jlIDs.widgetFactory
      }),
      name: widget => widget.context.path
    });
  }
}

function activateVp4jlNodeExtension(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer | null
) {
  const nodeExtension = new NodeExtension();
  app.shell.add(nodeExtension, 'left');

  if (restorer) {
    restorer.add(nodeExtension, 'vp4jlNodeExtension');
  }
  fetchNodeExtensions();
}

function fetchNodeExtensions() {
  requestAPI<any>('node_extension_manager')
    .then(data => {
      Object.entries(data.packages).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        LoadPackageToRegistry(key, value!);
      });
    })
    .catch(reason => {
      console.error(
        `The vp4jl server extension appears to be missing.\n${reason}`
      );
    });
}

function activateVp4jlFixContextMenuClose(
  app: JupyterFrontEnd,
  labShell: ILabShell
) {
  // close the context menu when switch the tab
  labShell.currentChanged.connect((_, args) => {
    if (args.oldValue instanceof VPDocWidget) {
      args.oldValue.content.deactivate();
    }
    closeDefaultContextMenu();
  });

  function closeDefaultContextMenu() {
    if (app.contextMenu.menu.isAttached) {
      app.contextMenu.menu.close();
    }
  }

  // close the context menu when click the tab
  function addClickEventToSideBar() {
    const sideBars = document.getElementsByClassName('jp-SideBar');
    if (!sideBars.length) {
      window.requestAnimationFrame(() => {
        addClickEventToSideBar();
      });
      return;
    }
    for (const sideBar of sideBars) {
      for (const tab of sideBar.getElementsByClassName('lm-TabBar-tab')) {
        (tab as HTMLElement).addEventListener('click', closeDefaultContextMenu);
      }
    }
  }

  window.requestAnimationFrame(() => {
    addClickEventToSideBar();
  });
}
