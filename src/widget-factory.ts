import { DocumentRegistry, ABCWidgetFactory } from '@jupyterlab/docregistry';
import { VPDocWidget, VPWidget } from './widget';

/**
 * A widget factory to create new intance of VPDocWidget.
 */
export class VPWidgetFactory extends ABCWidgetFactory<
  VPDocWidget,
  DocumentRegistry.ICodeModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions<VPDocWidget>) {
    super(options);
  }

  protected createNewWidget(
    context: DocumentRegistry.IContext<DocumentRegistry.ICodeModel>
  ): VPDocWidget {
    return new VPDocWidget({ context, content: new VPWidget(context) });
  }
}
