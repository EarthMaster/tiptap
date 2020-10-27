import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { Command } from '../Editor'
import { createExtension } from '../Extension'
import getNodeType from '../utils/getNodeType'

export const SetBlockType = createExtension({
  addCommands() {
    return {
      setBlockType: (typeOrName: string | NodeType, attrs = {}): Command => ({ state, dispatch }) => {
        const type = getNodeType(typeOrName, state.schema)

        return setBlockType(type, attrs)(state, dispatch)
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SetBlockType: typeof SetBlockType,
  }
}
