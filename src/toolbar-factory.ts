import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import { ExecutionIndicator } from '@jupyterlab/notebook';
import { Toolbar } from '@jupyterlab/apputils/lib/toolbar';
import { ToolbarRegistry, createDefaultFactory } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ToolbarItems as DocToolbarItems } from '@jupyterlab/docmanager-extension';
import { vp4jlCommandIDs } from './namepace';
import { VPWidget } from './widget';

interface IToolbarItemWithFactory {
  name: string;
  factory: (widget: VPWidget) => Widget;
}

type IToolbarItem = IToolbarItemWithFactory | ToolbarRegistry.IWidget;

export function getToolbarItems(commands: CommandRegistry): IToolbarItem[] {
  return [
    {
      name: 'save',
      factory: (widget: VPWidget) =>
        DocToolbarItems.createSaveButton(commands, widget.context.fileChanged)
    },
    { name: 'copy', command: vp4jlCommandIDs.copy },
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
      factory: (widget: VPWidget) =>
        Toolbar.createKernelNameItem(widget.sessionContext)
    },
    {
      name: 'executionProgress',
      factory: (widget: VPWidget) =>
        ExecutionIndicator.createExecutionIndicatorItem(
          // @ts-ignore
          widget,
          undefined,
          undefined
        )
    }
  ];
}

export function getToolbarFactory(
  commands: CommandRegistry,
  widgetFactory?: string
) {
  const items = getToolbarItems(commands);
  const defaultFactory = createDefaultFactory(commands);
  return (widget: VPWidget): DocumentRegistry.IToolbarItem[] => {
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
