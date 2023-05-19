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
import { ICommandPalette, ISessionContextDialogs } from '@jupyterlab/apputils';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
import { requestAPI } from './request';
import { VPDocWidget } from './widget';
import { VPModelFactory } from './model-factory';
import { VPWidgetFactory } from './widget-factory';
import { NodeExtension } from './node-extension';
import {
  vp4jlIDs as gVP4jlIDs,
  vp4jlCommandIDs as gVp4jlCommandIDs
} from './namepace';
import { getToolbarFactory } from './toolbar-factory';
import { IVPTracker, VPTracker, IVPTrackerToken } from './tracker';
import { LoadPackageToRegistry } from 'visual-programming-editor';

const vp4jl: JupyterFrontEndPlugin<IVPTracker> = {
  id: 'vp4jl:plugin',
  autoStart: true,
  provides: IVPTrackerToken,
  activate: activateVp4jl
};

const vp4jlCommands: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:Commands',
  autoStart: true,
  requires: [IVPTrackerToken, ISessionContextDialogs, IFileBrowserFactory],
  optional: [IDefaultFileBrowser],
  activate: activateVp4jlCommands
};

const vp4jlAttachCommandsToGui: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:AttachCommandsToGui',
  autoStart: true,
  requires: [IMainMenu, IVPTrackerToken],
  optional: [ILauncher, ICommandPalette],
  activate: activateVp4jlAttachCommandsToGui
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
  vp4jlCommands,
  vp4jlAttachCommandsToGui,
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
    defaultFor: [vp4jlIDs.fileType],
    toolbarFactory: getToolbarFactory(app.commands, vp4jlIDs.widgetFactory)
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

function activateVp4jlCommands(
  app: JupyterFrontEnd,
  tracker: IVPTracker,
  sessionDialogs: ISessionContextDialogs,
  browserFactory: IFileBrowserFactory,
  defaultFileBrowser: IDefaultFileBrowser | null
) {
  const vp4jlIDs = gVP4jlIDs;
  const cmdIds = gVp4jlCommandIDs;
  const { shell } = app;
  const isEnabled = (): boolean => {
    return isFocusVPWidget(shell, tracker);
  };

  app.commands.addCommand(cmdIds.createNew, {
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
        defaultFileBrowser?.model.path ||
        '';
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

  app.commands.addCommand(cmdIds.run, {
    label: 'Run Visual Programming File',
    caption: 'Run the visual programming file',
    execute: args => {
      const current = getCurrent(tracker, shell, args);
      if (current) {
        const { context, content } = current;
        return console.log(context.path, context.model.toString(), content);
      }
    },
    isEnabled
  });

  app.commands.addCommand(cmdIds.kernelInterrupt, {
    label: 'Interrupt Kernel',
    caption: 'Interrupt the kernel',
    execute: args => {
      const current = getCurrent(tracker, shell, args);
      if (!current) {
        return;
      }
      const kernel = current.context.sessionContext.session?.kernel;
      if (kernel) {
        return kernel.interrupt();
      }
    },
    isEnabled
  });

  app.commands.addCommand(cmdIds.kernelRestart, {
    label: 'Restart Kernel',
    caption: 'Restart the kernel',
    execute: args => {
      const current = getCurrent(tracker, shell, args);
      if (current) {
        return sessionDialogs.restart(current.sessionContext);
      }
    },
    isEnabled
  });
}

/**
 * Whether there is an active vp doc widget.
 */
function isFocusVPWidget(
  shell: JupyterFrontEnd.IShell,
  tracker: IVPTracker
): boolean {
  return (
    tracker.currentWidget !== null &&
    tracker.currentWidget === shell.currentWidget
  );
}

// Get the current widget and activate unless the args specify otherwise.
function getCurrent(
  tracker: IVPTracker,
  shell: JupyterFrontEnd.IShell,
  args: ReadonlyPartialJSONObject
): VPDocWidget | null {
  const widget = tracker.currentWidget;
  const activate = args['activate'] !== false;

  if (activate && widget) {
    shell.activateById(widget.id);
  }

  return widget;
}

function activateVp4jlAttachCommandsToGui(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu,
  tracker: IVPTracker,
  launcher: ILauncher | null,
  palette: ICommandPalette | null
) {
  const cmdIds = gVp4jlCommandIDs;
  const isEnabled = (): boolean => {
    return isFocusVPWidget(app.shell, tracker);
  };
  mainMenu.fileMenu.newMenu.addGroup([{ command: cmdIds.createNew }], 30);
  mainMenu.runMenu.codeRunners.run.add({
    id: cmdIds.run,
    isEnabled
  });
  mainMenu.kernelMenu.kernelUsers.interruptKernel.add({
    id: cmdIds.kernelInterrupt,
    isEnabled
  });
  mainMenu.kernelMenu.kernelUsers.restartKernel.add({
    id: cmdIds.kernelRestart,
    isEnabled
  });

  launcher?.add({
    command: cmdIds.createNew,
    category: cmdIds.commandCategory,
    rank: 0
  });

  palette?.addItem({
    command: cmdIds.createNew,
    category: cmdIds.commandCategory,
    args: { isPalette: true }
  });

  app.contextMenu.addItem({
    command: cmdIds.createNew,
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
