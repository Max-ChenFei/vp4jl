import { CodeCell } from '@jupyterlab/cells';
import { NotebookPanel } from '@jupyterlab/notebook';
import { VisualCodeEditorFactory } from './editor-factory';

export class ContentFactory extends NotebookPanel.ContentFactory {
  constructor(options: any) {
    super(options);
    this._editorFactories['code'] = options.editorFactory;
    this._editorFactories['visual code'] = VisualCodeEditorFactory;
  }
  createCodeCell(options: CodeCell.IOptions): CodeCell {
    console.log('createCodeCell', options.model.metadata);

    const opts = options;
    if (options.model.getMetadata('changeTo') === 'visual code') {
      opts.contentFactory = new ContentFactory({
        editorFactory: this._editorFactories['visual code']
      });
    } else if (
      options.contentFactory.editorFactory !== this._editorFactories['code']
    ) {
      opts.contentFactory = new ContentFactory({
        editorFactory: this._editorFactories['code']
      });
    }
    return super.createCodeCell(opts);
  }
  private _editorFactories: Record<string, any> = {};
}
