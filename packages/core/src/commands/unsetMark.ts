import { MarkType } from 'prosemirror-model'
import { Command, Commands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkRange from '../helpers/getMarkRange'

/**
 * Remove all marks in the current selection.
 */
export const unsetMark: Commands['unsetMark'] = typeOrName => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  let { from, to } = selection
  const { $from, empty } = selection

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  if (dispatch) {
    tr.removeMark(from, to, type)
    tr.removeStoredMark(type)
  }

  return true
}

declare module '@tiptap/core' {
  interface Commands {
    unsetMark: (typeOrName: string | MarkType) => Command,
  }
}
