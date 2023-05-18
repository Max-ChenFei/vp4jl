import { Token } from '@lumino/coreutils';
import { WidgetTracker } from '@jupyterlab/apputils';
import { VPDocWidget } from './widget';

export type IVPTracker = WidgetTracker<VPDocWidget>;

export const IVPTrackerToken = new Token<IVPTracker>(
  '@jupyterlab/vp4jl:IVPTracker',
  `A widget tracker for visual programming files.
  Use this if you want to be able to iterate over and interact with file editors
  created by the application.`
);

export class VPTracker
  extends WidgetTracker<VPDocWidget>
  implements IVPTracker {}
