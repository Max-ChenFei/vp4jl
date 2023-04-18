import { TextModelFactory } from '@jupyterlab/docregistry';
import { Contents } from '@jupyterlab/services';

// ICodeModel is used internally for the document model representation.

export class VPModelFactory extends TextModelFactory {
  get name(): string {
    return 'vp4jl';
  }
  get fileFormat(): Contents.FileFormat {
    return 'json';
  }
}
