import { DocumentRegistry, DocumentModel } from '@jupyterlab/docregistry';

export type IVPModel = DocumentRegistry.ICodeModel;
export class VPModel extends DocumentModel implements IVPModel {}
