import { Notebook as NB } from '@jupyterlab/notebook';
// import { ArrayExt } from '@lumino/algorithm';
/**
 * The class name added to notebook widget cells.
 */
// const NB_CELL_CLASS = 'jp-Notebook-cell';

export class VPNotebook extends NB {
  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the notebook panel's node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    if (!this.model) {
      return;
    }

    switch (event.type) {
      case 'mousedown':
        console.log('mousedown', event);

        // if (event.eventPhase === Event.CAPTURING_PHASE) {
        //   this._evtMouseDownCapture(event as MouseEvent);
        // } else {
        //   // Skip processing the event when it resulted from a toolbar button click
        //   if (!event.defaultPrevented) {
        //     this._evtMouseDown(event as MouseEvent);
        //   }

        break;
      //   case 'focusout':
      //     console.log('focusout');
      //     // this._evtFocusOut(event as MouseEvent);
      //     break;
      default:
        super.handleEvent(event);
        break;
    }
  }
  /**
   * Handle `contextmenu` event.
   */
  //   private evtContextMenuCapture(event: PointerEvent): void {
  //     // Allow the event to propagate un-modified if the user
  //     // is holding the shift-key (and probably requesting
  //     // the native context menu).
  //     if (event.shiftKey) {
  //       return;
  //     }

  //     const [target, index] = this.findEventTargetAndCell(event);
  //     const widget = this.widgets[index];

  //     if (widget && widget.editorWidget?.node.contains(target)) {
  //       // Prevent CodeMirror from focusing the editor.
  //       // TODO: find an editor-agnostic solution.
  //       event.preventDefault();
  //     }
  //   }
  /**
   * Find the cell index containing the target html element.
   *
   * #### Notes
   * Returns -1 if the cell is not found.
   */
  //   private findCell(node: HTMLElement): number {
  //     // Trace up the DOM hierarchy to find the root cell node.
  //     // Then find the corresponding child and select it.
  //     let n: HTMLElement | null = node;
  //     while (n && n !== this.node) {
  //       if (n.classList.contains(NB_CELL_CLASS)) {
  //         const i = ArrayExt.findFirstIndex(
  //           this.widgets,
  //           widget => widget.node === n
  //         );
  //         if (i !== -1) {
  //           return i;
  //         }
  //         break;
  //       }
  //       n = n.parentElement;
  //     }
  //     return -1;
  //   }

  /**
   * Find the target of html mouse event and cell index containing this target.
   *
   * #### Notes
   * Returned index is -1 if the cell is not found.
   */
  //   private findEventTargetAndCell(event: MouseEvent): [HTMLElement, number] {
  //     let target = event.target as HTMLElement;
  //     let index = this.findCell(target);
  //     if (index === -1) {
  //       // `event.target` sometimes gives an orphaned node in Firefox 57, which
  //       // can have `null` anywhere in its parent line. If we fail to find a cell
  //       // using `event.target`, try again using a target reconstructed from the
  //       // position of the click event.
  //       target = document.elementFromPoint(
  //         event.clientX,
  //         event.clientY
  //       ) as HTMLElement;
  //       index = this.findCell(target);
  //     }
  //     return [target, index];
  //   }

  //   /**
  //    * Handle `mousedown` event in the capture phase for the widget.
  //    */
  //   private evtMouseDownCapture(event: MouseEvent): void {
  //     const { button, shiftKey } = event;

  //     const [target, index] = this.findEventTargetAndCell(event);
  //     const widget = this.widgets[index];

  //     // On OS X, the context menu may be triggered with ctrl-left-click. In
  //     // Firefox, ctrl-left-click gives an event with button 2, but in Chrome,
  //     // ctrl-left-click gives an event with button 0 with the ctrl modifier.
  //     if (
  //       button === 2 &&
  //       !shiftKey &&
  //       widget &&
  //       widget.editorWidget?.node.contains(target)
  //     ) {
  //       this.mode = 'command';

  //       // Prevent CodeMirror from focusing the editor.
  //       // TODO: find an editor-agnostic solution.
  //       event.preventDefault();
  //     }
  //   }

  /**
   * Handle `focus` events for the widget.
   */
  //   private evtFocusIn(event: MouseEvent): void {
  //     const target = event.target as HTMLElement;
  //     const index = this.findCell(target);
  //     if (index !== -1) {
  //       const widget = this.widgets[index];
  //       // If the editor itself does not have focus, ensure command mode.
  //       if (widget.editorWidget && !widget.editorWidget.node.contains(target)) {
  //         this.mode = 'command';
  //       }
  //       this.activeCellIndex = index;
  //       // If the editor has focus, ensure edit mode.
  //       const node = widget.editorWidget?.node;
  //       if (node?.contains(target)) {
  //         this.mode = 'edit';
  //       }
  //       this.activeCellIndex = index;
  //     } else {
  //       // No cell has focus, ensure command mode.
  //       this.mode = 'command';
  //     }
  //   }
}
