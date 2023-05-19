import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import { Toolbar } from '@jupyterlab/apputils/lib/toolbar';
import { ToolbarRegistry, createDefaultFactory } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ToolbarItems as DocToolbarItems } from '@jupyterlab/docmanager-extension';
import { VPDocWidget } from './widget';

interface IToolbarItemWithFactory {
  name: string;
  factory: (widget: VPDocWidget) => Widget;
}

type IToolbarItem = IToolbarItemWithFactory | ToolbarRegistry.IWidget;

export function getToolbarItems(commands: CommandRegistry): IToolbarItem[] {
  return [
    {
      name: 'save',
      factory: (widget: VPDocWidget) =>
        DocToolbarItems.createSaveButton(commands, widget.context.fileChanged)
    },
    { name: 'run', command: 'runmenu:run' },
    { name: 'interrupt', command: 'kernelmenu:interrupt' },
    { name: 'restart', command: 'kernelmenu:restart' },
    {
      name: 'restart-and-run',
      command: 'runmenu:restart-and-run-all'
    },
    { name: 'spacer', type: 'spacer' },
    {
      name: 'kernelName',
      factory: (widget: VPDocWidget) =>
        Toolbar.createKernelNameItem(widget.sessionContext)
    }
  ];
}

export function getToolbarFactory(
  commands: CommandRegistry,
  widgetFactory?: string
) {
  const items = getToolbarItems(commands);
  const defaultFactory = createDefaultFactory(commands);
  return (widget: VPDocWidget): DocumentRegistry.IToolbarItem[] => {
    return items.map(toolbar => ({
      name: toolbar.name,
      widget: toolbar.factory
        ? (toolbar as IToolbarItemWithFactory).factory(widget)
        : defaultFactory(
            widgetFactory ?? '',
            widget,
            toolbar as ToolbarRegistry.IWidget
          )
    }));
  };
}
