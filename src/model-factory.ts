import { TextModelFactory } from '@jupyterlab/docregistry';
import { vp4jlIDs } from './namepace';
// ICodeModel is used internally for the document model representation.

export class VPModelFactory extends TextModelFactory {
  get name(): string {
    return vp4jlIDs.modelFactory;
  }
}
