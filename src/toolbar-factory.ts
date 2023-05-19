import { Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ToolbarItems as DocToolbarItems } from '@jupyterlab/docmanager-extension';
import { VPDocWidget } from './widget';

interface IToolbarItemWithFactory {
  name: string;
  factory: (widget: VPDocWidget) => Widget;
}

export function getToolbarItems(
  commands: CommandRegistry
): IToolbarItemWithFactory[] {
  return [
    {
      name: 'save',
      factory: (widget: VPDocWidget) =>
        DocToolbarItems.createSaveButton(commands, widget.context.fileChanged)
    }
  ];
}

export function getToolbarFactory(commands: CommandRegistry) {
  const items = getToolbarItems(commands);
  return (widget: VPDocWidget): DocumentRegistry.IToolbarItem[] => {
    return items.map(toolbar => ({
      name: toolbar.name,
      widget: toolbar.factory(widget)
    }));
  };
}
