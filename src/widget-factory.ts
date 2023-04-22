import { DocumentRegistry, ABCWidgetFactory } from '@jupyterlab/docregistry';
import { VPDocWidget, VPWidget } from './widget';

/**
 * A widget factory to create new intance of VPDocWidget.
 */
export class VPWidgetFactory extends ABCWidgetFactory<
  VPDocWidget,
  DocumentRegistry.ICodeModel
> {
  // the main widget is main area of the jupyter lab
  private _mainWidget: HTMLElement | null = null;
  private _widgets: VPDocWidget[] = [];
  private _onMouseDown = this.deactivateWidgetIfMouseDownOut.bind(this);
  constructor(options: DocumentRegistry.IWidgetFactoryOptions<VPDocWidget>) {
    super(options);
  }

  protected createNewWidget(
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ): VPDocWidget {
    const w = new VPDocWidget({ context, content: new VPWidget(context) });
    this.onWidgetCreated(w);
    w.disposed.connect(w => {
      this.onWidgetDisposed(w);
    });
    return w;
  }

  private deactivateWidgetIfMouseDownOut(event: MouseEvent) {
    for (const w of this._widgets) {
      const rect = w.node.getBoundingClientRect();
      const hidden =
        !rect ||
        (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0);
      if (hidden) {
        continue;
      }
      const isInWidget =
        rect.x <= event.clientX &&
        event.clientX <= rect.x + rect.width &&
        rect.y <= event.clientY &&
        event.clientY <= rect.y + rect.height;
      if (!isInWidget) {
        w.content.deactivate();
      } else {
        w.content.activate();
      }
    }
  }

  private onWidgetCreated(w: VPDocWidget) {
    this._widgets.push(w);
    if (this._mainWidget === null) {
      this._mainWidget = document.getElementById('main');
    }
    if (this._widgets.length === 1) {
      this._mainWidget?.addEventListener('mousedown', this._onMouseDown);
      document.addEventListener('contextmenu', this._onMouseDown);
    }
  }

  private onWidgetDisposed(widget: VPDocWidget) {
    this._widgets.splice(this._widgets.indexOf(widget), 1);
    if (this._widgets.length === 0) {
      this._mainWidget?.removeEventListener('mousedown', this._onMouseDown);
      document.removeEventListener('contextmenu', this._onMouseDown);
    }
  }
}
