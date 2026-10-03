import { describe, expect, it } from 'vitest';
import { getSchema } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import { history, undo } from '@tiptap/pm/history';
import { blockTransaction, imageFileError, matchingSlashItems, slashRange } from '@/lib/blog/editor-actions';
const schema = getSchema([StarterKit, TableKit, Image]);
const paragraph = (text: string) => schema.nodes.paragraph.create(null, text ? schema.text(text) : undefined);
function stateAt(texts: string[], index = 0) {
  const doc = schema.nodes.doc.create(null, texts.map(paragraph));
  let pos = 1;
  for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize;
  return EditorState.create({ schema, doc, selection: TextSelection.create(doc, pos), plugins: [history()] });
}
function texts(state: EditorState) { const result: string[] = []; state.doc.forEach(n => result.push(n.textContent)); return result; }
describe('editor contextual actions', () => {
  it('only recognizes a slash command in an otherwise empty top-level paragraph', () => {
    let state = stateAt(['/bảng']);
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, state.doc.content.size - 1)));
    expect(slashRange(state)?.query).toBe('bảng');
    expect(matchingSlashItems('bảng').map(n => n.id)).toEqual(['table']);
    expect(matchingSlashItems('GIF').map(n => n.id)).toEqual(['image']);
    for (const text of ['https://example.com/', 'hello /table', '/wrong!']) {
      let next = stateAt([text]); next = next.apply(next.tr.setSelection(TextSelection.create(next.doc, next.doc.content.size - 1)));
      expect(slashRange(next)).toBeNull();
    }
  });
  it('moves a whole block both ways and keeps the operation undoable', () => {
    const original = stateAt(['One', 'Two', 'Three'], 1);
    const up = original.apply(blockTransaction(original, 'up')!);
    expect(texts(up)).toEqual(['Two', 'One', 'Three']);
    let reverted = up;
    expect(undo(up, tr => { reverted = up.apply(tr); })).toBe(true);
    expect(reverted.doc.eq(original.doc)).toBe(true);
    const down = original.apply(blockTransaction(original, 'down')!);
    expect(texts(down)).toEqual(['One', 'Three', 'Two']);
    expect(blockTransaction(stateAt(['One']), 'up')).toBeNull();
    expect(blockTransaction(stateAt(['One']), 'down')).toBeNull();
  });
  it('duplicates structured tables intact and deletes the last block safely', () => {
    const cell = schema.nodes.tableCell.create(null, paragraph('Cell'));
    const table = schema.nodes.table.create(null, schema.nodes.tableRow.create(null, [cell]));
    const doc = schema.nodes.doc.create(null, [table, paragraph('After')]);
    const state = EditorState.create({ schema, doc, selection: TextSelection.near(doc.resolve(3)) });
    const duplicated = state.apply(blockTransaction(state, 'duplicate')!);
    expect(duplicated.doc.child(0).eq(duplicated.doc.child(1))).toBe(true);
    expect(duplicated.doc.child(2).textContent).toBe('After');
    const only = stateAt(['Only']);
    const deleted = only.apply(blockTransaction(only, 'delete')!);
    expect(deleted.doc.childCount).toBe(1);
    expect(deleted.doc.firstChild?.type.name).toBe('paragraph');
    expect(deleted.doc.textContent).toBe('');
  });
  it('maps pending image insertion through concurrent typing', () => {
    const state = stateAt(['First', 'Second'], 1);
    const bookmark = state.selection.getBookmark();
    const transaction = state.tr.insertText('New ', 1);
    const updated = state.apply(transaction);
    expect(bookmark.map(transaction.mapping).resolve(updated.doc).$from.parent.textContent).toBe('Second');
  });
  it('validates media size and format before consuming a file paste/drop', () => {
    expect(imageFileError({ type: 'image/gif', size: 500 })).toBeNull();
    expect(imageFileError({ type: 'image/svg+xml', size: 500 })).toBeTruthy();
    expect(imageFileError({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toBeTruthy();
  });
});
