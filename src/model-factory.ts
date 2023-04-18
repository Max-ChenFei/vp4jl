import { TextModelFactory } from '@jupyterlab/docregistry';

// ICodeModel is used internally for the document model representation.

export const VP_MODEL_FACTORY = 'vp4jl_model_factory';

export class VPModelFactory extends TextModelFactory {
  get name(): string {
    return VP_MODEL_FACTORY;
  }
}
