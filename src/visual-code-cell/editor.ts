/* eslint-disable @typescript-eslint/ban-types */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { insertNewlineAndIndent } from '@codemirror/commands';
// import { Command, EditorView } from '@codemirror/view';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { UUID } from '@lumino/coreutils';
import { Signal } from '@lumino/signaling';
import { createVPWidget } from './widget';

/**
 * The class name added to CodeMirrorWidget instances.
 */
const EDITOR_CLASS = 'jp-VPEditor';

/**
 * CodeMirror editor.
 */
export class VisualCodeEditor implements CodeEditor.IEditor {
  /**
   * Construct a CodeMirror editor.
   */
  constructor(options: any) {
    const host = (this.host = options.host);
    host.classList.add(EDITOR_CLASS);
    host.classList.add('jp-Editor');
    host.addEventListener('focus', this, true);
    host.addEventListener('blur', this, true);
    host.addEventListener('scroll', this, true);

    this._uuid = options.uuid ?? UUID.uuid4();

    const model = (this._model = options.model);
    console.log('CodeMirrorEditor', model);
    this._editor = createVPWidget(this._uuid, model, host);
    // model.mimeTypeChanged.connect(this._onMimeTypeChanged, this);
  }

  /**
   * A signal emitted when either the top or bottom edge is requested.
   */
  readonly edgeRequested = new Signal<this, CodeEditor.EdgeLocation>(this);

  /**
   * The DOM node that hosts the editor.
   */
  readonly host: HTMLElement;

  /**
   * The uuid of this editor;
   */
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }

  /**
   * Get the codemirror editor wrapped by the editor.
   */
  get editor(): any {
    return this._editor;
  }

  /**
   * Get the codemirror doc wrapped by the widget.
   */
  get doc(): Text {
    throw new Error('Method not implemented yet');
  }

  /**
   * Get the number of lines in the editor.
   */
  get lineCount(): number {
    throw new Error('Method not implemented yet');
  }

  /**
   * Returns a model for this editor.
   */
  get model(): CodeEditor.IModel {
    return this._model;
  }

  /**
   * The height of a line in the editor in pixels.
   */
  get lineHeight(): number {
    throw new Error('Method not implemented yet');
  }

  /**
   * The widget of a character in the editor in pixels.
   */
  get charWidth(): number {
    throw new Error('Method not implemented yet');
  }

  /**
   * Tests whether the editor is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this.host.removeEventListener('focus', this, true);
    this.host.removeEventListener('blur', this, true);
    this.host.removeEventListener('scroll', this, true);
    // this._configurator.dispose();
    Signal.clearData(this);
    // this.editor.destroy();
    this.host.removeChild(this._editor);
  }

  /**
   * Get a config option for the editor.
   */
  getOption(option: string): unknown {
    // return this._configurator.getOption(option);
    throw new Error('Method not implemented yet');
  }

  /**
   * Whether the option exists or not.
   */
  hasOption(option: string): boolean {
    throw new Error('Method not implemented yet');
    // return this._configurator.hasOption(option);
  }

  /**
   * Set a config option for the editor.
   */
  setOption(option: string, value: unknown): void {
    throw new Error('Method not implemented yet');
    // this._configurator.setOption(option, value);
  }

  /**
   * Set config options for the editor.
   *
   * This method is preferred when setting several options. The
   * options are set within an operation, which only performs
   * the costly update at the end, and not after every option
   * is set.
   */
  setOptions(options: Record<string, any>): void {
    throw new Error('Method not implemented yet');
    // this._configurator.setOptions(options);
  }

  /**
   * Inject an extension into the editor
   *
   * @alpha
   * @experimental
   * @param ext CodeMirror 6 extension
   */
  injectExtension(ext: any): void {
    throw new Error('Method not implemented yet');
    // this._configurator.injectExtension(this._editor, ext);
  }

  /**
   * Returns the content for the given line number.
   */
  getLine(line: number): string | undefined {
    throw new Error('Method not implemented yet');
    // TODO: CM6 remove +1 when CM6 first line number has propagated
    // line = line + 1;
    // return line <= this.doc.lines ? this.doc.line(line).text : undefined;
  }

  /**
   * Find an offset for the given position.
   */
  getOffsetAt(position: CodeEditor.IPosition): number {
    throw new Error('Method not implemented yet');
    // TODO: CM6 remove +1 when CM6 first line number has propagated
    // return this.doc.line(position.line + 1).from + position.column;
  }

  /**
   * Find a position for the given offset.
   */
  getPositionAt(offset: number): CodeEditor.IPosition {
    throw new Error('Method not implemented yet');
    // // TODO: CM6 remove -1 when CM6 first line number has propagated
    // const line = this.doc.lineAt(offset);
    // return { line: line.number - 1, column: offset - line.from };
  }

  /**
   * Undo one edit (if any undo events are stored).
   */
  undo(): void {
    throw new Error('Method not implemented yet');
    this.model.sharedModel.undo();
  }

  /**
   * Redo one undone edit.
   */
  redo(): void {
    throw new Error('Method not implemented yet');
    this.model.sharedModel.redo();
  }

  /**
   * Clear the undo history.
   */
  clearHistory(): void {
    this.model.sharedModel.clearUndoHistory();
  }

  /**
   * Brings browser focus to this editor text.
   */
  focus(): void {
    this._editor.focus();
  }

  /**
   * Test whether the editor has keyboard focus.
   */
  hasFocus(): boolean {
    return this._editor.hasFocus;
  }

  /**
   * Explicitly blur the editor.
   */
  blur(): void {
    this._editor.contentDOM.blur();
  }

  get state(): any {
    throw new Error('Method not implemented yet');
    return this._editor.state;
  }

  firstLine(): number {
    // TODO: return 1 when CM6 first line number has propagated
    return 0;
  }

  lastLine(): number {
    throw new Error('Method not implemented yet');
    // return this.doc.lines - 1;
  }

  cursorCoords(
    where: boolean,
    mode?: 'window' | 'page' | 'local'
  ): { left: number; top: number; bottom: number } {
    const selection = this.state.selection.main;
    const pos = where ? selection.from : selection.to;
    const rect = this.editor.coordsAtPos(pos);
    return rect as { left: number; top: number; bottom: number };
  }

  getRange(
    from: { line: number; ch: number },
    to: { line: number; ch: number },
    separator?: string
  ): string {
    const fromOffset = this.getOffsetAt(this._toPosition(from));
    const toOffset = this.getOffsetAt(this._toPosition(to));
    return this.state.sliceDoc(fromOffset, toOffset);
  }

  /**
   * Reveal the given position in the editor.
   */
  revealPosition(position: CodeEditor.IPosition): void {
    // const offset = this.getOffsetAt(position);
    // this._editor.dispatch({
    //   effects: EditorView.scrollIntoView(offset)
    // });
  }

  /**
   * Reveal the given selection in the editor.
   */
  revealSelection(selection: CodeEditor.IRange): void {
    throw new Error('Method not implemented yet');
    // const start = this.getOffsetAt(selection.start);
    // const end = this.getOffsetAt(selection.end);
    // this._editor.dispatch({
    //   effects: EditorView.scrollIntoView(EditorSelection.range(start, end))
    // });
  }

  /**
   * Get the window coordinates given a cursor position.
   */
  getCoordinateForPosition(
    position: CodeEditor.IPosition
  ): CodeEditor.ICoordinate {
    const offset = this.getOffsetAt(position);
    const rect = this.editor.coordsAtPos(offset);
    return rect as CodeEditor.ICoordinate;
  }

  /**
   * Get the cursor position given window coordinates.
   *
   * @param coordinate - The desired coordinate.
   *
   * @returns The position of the coordinates, or null if not
   *   contained in the editor.
   */
  getPositionForCoordinate(
    coordinate: CodeEditor.ICoordinate
  ): CodeEditor.IPosition | null {
    const offset = this.editor.posAtCoords({
      x: coordinate.left,
      y: coordinate.top
    });
    return this.getPositionAt(offset!) || null;
  }

  /**
   * Returns the primary position of the cursor, never `null`.
   */
  getCursorPosition(): CodeEditor.IPosition {
    const offset = this.state.selection.main.head;
    return this.getPositionAt(offset);
  }

  /**
   * Set the primary position of the cursor.
   *
   * #### Notes
   * This will remove any secondary cursors.
   */
  setCursorPosition(
    position: CodeEditor.IPosition,
    options?: { bias?: number; origin?: string; scroll?: boolean }
  ): void {
    const offset = this.getOffsetAt(position);
    this.editor.dispatch({
      selection: { anchor: offset },
      scrollIntoView: true
    });
    // If the editor does not have focus, this cursor change
    // will get screened out in _onCursorsChanged(). Make an
    // exception for this method.
    if (!this.editor.hasFocus) {
      this.model.selections.set(this.uuid, this.getSelections());
    }
  }

  /**
   * Returns the primary selection, never `null`.
   */
  getSelection(): CodeEditor.ITextSelection {
    return this.getSelections()[0];
  }

  /**
   * Set the primary selection. This will remove any secondary cursors.
   */
  setSelection(selection: CodeEditor.IRange): void {
    this.setSelections([selection]);
  }

  /**
   * Gets the selections for all the cursors, never `null` or empty.
   */
  getSelections(): CodeEditor.ITextSelection[] {
    throw new Error('Method not implemented yet');
    // const selections = this.state.selection.ranges; //= [{anchor: number, head: number}]
    // if (selections.length > 0) {
    //   const sel = selections.map(r => ({
    //     anchor: this._toCodeMirrorPosition(this.getPositionAt(r.from)),
    //     head: this._toCodeMirrorPosition(this.getPositionAt(r.to))
    //   }));
    //   return sel.map(selection => this._toSelection(selection));
    // }
    // const cursor = this._toCodeMirrorPosition(
    //   this.getPositionAt(this.state.selection.main.head)
    // );
    // const selection = this._toSelection({ anchor: cursor, head: cursor });
    // return [selection];
  }

  /**
   * Sets the selections for all the cursors, should not be empty.
   * Cursors will be removed or added, as necessary.
   * Passing an empty array resets a cursor position to the start of a document.
   */
  setSelections(selections: CodeEditor.IRange[]): void {
    throw new Error('Method not implemented yet');
    // const sel = selections.length
    //   ? selections.map(r =>
    //       EditorSelection.range(
    //         this.getOffsetAt(r.start),
    //         this.getOffsetAt(r.end)
    //       )
    //     )
    //   : [EditorSelection.range(0, 0)];
    // this.editor.dispatch({ selection: EditorSelection.create(sel) });
  }

  /**
   * Replaces the current selection with the given text.
   *
   * Behaviour for multiple selections is undefined.
   *
   * @param text The text to be inserted.
   */
  replaceSelection(text: string): void {
    throw new Error('Method not implemented yet');
    const firstSelection = this.getSelections()[0];
    this.model.sharedModel.updateSource(
      this.getOffsetAt(firstSelection.start),
      this.getOffsetAt(firstSelection.end),
      text
    );
    const newPosition = this.getPositionAt(
      this.getOffsetAt(firstSelection.start) + text.length
    );
    this.setSelection({ start: newPosition, end: newPosition });
  }

  /**
   * Get a list of tokens for the current editor text content.
   */
  getTokens(): CodeEditor.IToken[] {
    throw new Error('Method not implemented yet');
    // const tokens: CodeEditor.IToken[] = [];
    // const tree = ensureSyntaxTree(this.state, this.doc.length);
    // if (tree) {
    //   tree.iterate({
    //     enter: (ref: SyntaxNodeRef) => {
    //       if (ref.node.firstChild === null) {
    //         tokens.push({
    //           value: this.state.sliceDoc(ref.from, ref.to),
    //           offset: ref.from,
    //           type: ref.name
    //         });
    //       }
    //       return true;
    //     }
    //   });
    // }
    // return tokens;
  }

  /**
   * Get the token at a given editor position.
   */
  getTokenAt(offset: number): CodeEditor.IToken {
    throw new Error('Method not implemented yet');
    // const tree = ensureSyntaxTree(this.state, offset);
    // let token: CodeEditor.IToken | null = null;
    // if (tree) {
    //   tree.iterate({
    //     enter: (ref: SyntaxNodeRef) => {
    //       // If a token has already been discovered, stop iterating.
    //       if (token) {
    //         return false;
    //       }
    //       // If it is not a leaf, keep iterating.
    //       if (ref.node.firstChild) {
    //         return true;
    //       }
    //       // If the relevant leaf token has been found, stop iterating.
    //       if (offset >= ref.from && offset <= ref.to) {
    //         token = {
    //           value: this.state.sliceDoc(ref.from, ref.to),
    //           offset: ref.from,
    //           type: ref.name
    //         };
    //         return false;
    //       }
    //       return true;
    //     }
    //   });
    // }
    // return token || { offset, value: '' };
  }

  /**
   * Get the token a the cursor position.
   */
  getTokenAtCursor(): CodeEditor.IToken {
    return this.getTokenAt(this.state.selection.main.head);
  }

  /**
   * Insert a new indented line at the current cursor position.
   */
  newIndentedLine(): void {
    insertNewlineAndIndent({
      state: this.state,
      dispatch: this.editor.dispatch
    });
  }

  /**
   * Execute a codemirror command on the editor.
   *
   * @param command - The name of the command to execute.
   */
  execCommand(command: any): void {
    // command(this.editor);
  }

  protected onConfigChanged(
    configurator: any,
    changes: Record<string, any>
  ): void {
    throw new Error('Method not implemented yet');
    configurator.reconfigureExtensions(this._editor, changes);
  }

  /**
   * Handle keydown events from the editor.
   */
  protected onKeydown(event: KeyboardEvent): boolean {
    return false;
    // const position = this.state.selection.main.head;
    // if (position === 0 && event.keyCode === UP_ARROW) {
    //   if (!event.shiftKey) {
    //     this.edgeRequested.emit('top');
    //   }
    //   return false;
    // }
    // const line = this.doc.lineAt(position).number;
    // if (line === 1 && event.keyCode === UP_ARROW) {
    //   if (!event.shiftKey) {
    //     this.edgeRequested.emit('topLine');
    //   }
    //   return false;
    // }
    // const length = this.doc.length;
    // if (position === length && event.keyCode === DOWN_ARROW) {
    //   if (!event.shiftKey) {
    //     this.edgeRequested.emit('bottom');
    //   }
    //   return false;
    // }
    // return false;
  }

  /**
   * Handles a mime type change.
   */
  //   private _onMimeTypeChanged(): void {
  // TODO: should we provide a hook for when the mode is done being set?
  // this._languages
  //   .getLanguage(this._model.mimeType)
  //   .then(language => {
  //     this._editor.dispatch({
  //       effects: this._language.reconfigure(language?.support ?? [])
  //     });
  //   })
  //   .catch(reason => {
  //     console.log(
  //       `Failed to load language for '${this._model.mimeType}'.`,
  //       reason
  //     );
  //     this._editor.dispatch({
  //       effects: this._language.reconfigure([])
  //     });
  //   });
  //   }

  /**
   * Handles a cursor activity event.
   */
  //   private _onCursorActivity(): void {
  //     // Only add selections if the editor has focus. This avoids unwanted
  //     // triggering of cursor activity due to collaborator actions.
  //     if (this._editor.hasFocus) {
  //       const selections = this.getSelections();
  //       this.model.selections.set(this.uuid, selections);
  //     }
  //   }

  /**
   * Converts a code mirror selection to an editor selection.
   */
  //   private _toSelection(selection: {
  //     anchor: { line: number; ch: number };
  //     head: { line: number; ch: number };
  //   }): CodeEditor.ITextSelection {
  //     return {
  //       uuid: this.uuid,
  //       start: this._toPosition(selection.anchor),
  //       end: this._toPosition(selection.head)
  //     };
  //   }

  /**
   * Convert a code mirror position to an editor position.
   */
  private _toPosition(position: { line: number; ch: number }) {
    return {
      line: position.line,
      column: position.ch
    };
  }

  //   /**
  //    * Convert an editor position to a code mirror position.
  //    */
  //   private _toCodeMirrorPosition(position: CodeEditor.IPosition) {
  //     return {
  //       line: position.line,
  //       ch: position.column
  //     };
  //   }

  //   /**
  //    * Handles document changes.
  //    */
  //   private _onDocChanged(update: ViewUpdate) {
  //     // if (update.transactions.length && update.transactions[0].selection) {
  //     //   this._onCursorActivity();
  //     // }
  //   }

  /**
   * Handle the DOM events for the editor.
   *
   * @param event - The DOM event sent to the editor.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the editor's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'focus':
        this._evtFocus(event as FocusEvent);
        break;
      case 'blur':
        this._evtBlur(event as FocusEvent);
        break;
      default:
        break;
    }
  }

  /**
   * Handle `focus` events for the editor.
   */
  private _evtFocus(event: FocusEvent): void {
    this.host.classList.add('jp-mod-focused');

    // Update the selections on editor gaining focus because
    // the onCursorActivity function filters usual cursor events
    // based on the editor's focus.
    // this._onCursorActivity();
  }

  /**
   * Handle `blur` events for the editor.
   */
  private _evtBlur(event: FocusEvent): void {
    this.host.classList.remove('jp-mod-focused');
  }

  //   private _configurator: IExtensionsHandler;
  private _editor: any;
  private _isDisposed = false;
  //   private _language = new Compartment();
  //   private _languages: IEditorLanguageRegistry;
  private _model: CodeEditor.IModel;
  private _uuid = '';
}
