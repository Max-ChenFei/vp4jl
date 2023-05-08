import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { VPModelFactory, VP_MODEL_FACTORY } from './model-factory';
import { VPWidgetFactory } from './widget-factory';
import { requestAPI } from './handler';
import { VPDocWidget } from './widget';
import { LoadPackageToRegistry } from 'visual-programming-editor2';
import { NodeExtension } from './node-extension';
/**
 * Initialization data for the vp4jl extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:plugin',
  autoStart: true,
  requires: [ILabShell, IFileBrowserFactory, IMainMenu],
  optional: [ILayoutRestorer, ILauncher, ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    browserFactory: IFileBrowserFactory,
    mainMenu: IMainMenu,
    restorer: ILayoutRestorer | null,
    launcher: ILauncher | null,
    palette: ICommandPalette | null
  ) => {
    const VP_FILE_TYPE = 'vp4jl';
    const VP_WIDGET_FACTORY = 'VP Editor';
    const TRACKER_NAMESPACE = 'vp4jl';
    const FILE_EXTENSION = '.vp4jl';
    const NEW_VP_File_COMMAND = 'vp4jl:new-file';
    const COMMAND_CATEGORY = 'Visual Programming';

    // track and restore the widgets after reload
    const tracker = new WidgetTracker<VPDocWidget>({
      namespace: TRACKER_NAMESPACE
    });

    if (restorer) {
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({
          path: widget.context.path,
          factory: VP_WIDGET_FACTORY
        }),
        name: widget => widget.context.path
      });
    }

    // add node extension to the left stack panel
    const nodeExtension = new NodeExtension();
    app.shell.add(nodeExtension, 'left');
    if (restorer) {
      restorer.add(nodeExtension, 'vp4jlNodeExtension');
    }

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

    // widget factory, file type, model factory registration
    const widgetFactory = new VPWidgetFactory({
      name: VP_WIDGET_FACTORY,
      modelName: VP_MODEL_FACTORY,
      fileTypes: [VP_FILE_TYPE],
      defaultFor: [VP_FILE_TYPE]
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
      name: VP_FILE_TYPE,
      displayName: 'VP File',
      mimeTypes: ['text/json', 'application/json'],
      extensions: [FILE_EXTENSION],
      fileFormat: 'text',
      contentType: 'file'
    });

    // add new file command to the file menu, launcher and palette
    app.commands.addCommand(NEW_VP_File_COMMAND, {
      label: args =>
        args['isPalette']
          ? 'New Visual Programming File'
          : 'Visual Programming File',
      caption: 'Create a new VP file',
      execute: async args => {
        const cwd =
          args['cwd'] ||
          browserFactory.tracker.currentWidget?.model.path ||
          browserFactory.defaultBrowser.model.path;
        const model = await app.commands.execute('docmanager:new-untitled', {
          path: cwd,
          contentType: 'file',
          fileFormat: 'text',
          ext: FILE_EXTENSION,
          type: 'file'
        });

        return app.commands.execute('docmanager:open', {
          path: model.path,
          factory: VP_WIDGET_FACTORY
        });
      }
    });

    mainMenu.fileMenu.newMenu.addGroup([{ command: NEW_VP_File_COMMAND }], 30);

    if (launcher) {
      launcher.add({
        command: NEW_VP_File_COMMAND,
        category: COMMAND_CATEGORY,
        rank: 0
      });
    }
    if (palette) {
      palette.addItem({
        command: NEW_VP_File_COMMAND,
        category: COMMAND_CATEGORY,
        args: { isPalette: true }
      });
    }

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
          (tab as HTMLElement).addEventListener(
            'click',
            closeDefaultContextMenu
          );
        }
      }
    }

    window.requestAnimationFrame(() => {
      addClickEventToSideBar();
    });
  }
};

export default plugin;
