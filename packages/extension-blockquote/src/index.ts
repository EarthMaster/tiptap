import { Command, Node } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BlockquoteOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /^\s*>\s$/gm

const Blockquote = Node.create({
  name: 'blockquote',

  defaultOptions: <BlockquoteOptions>{
    HTMLAttributes: {},
  },

  content: 'block*',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      { tag: 'blockquote' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Set a blockquote node
       */
      setBlockquote: (): Command => ({ commands }) => {
        return commands.wrapIn('blockquote')
      },
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: (): Command => ({ commands }) => {
        return commands.toggleWrap('blockquote')
      },
      /**
       * Unset a blockquote node
       */
      unsetBlockquote: (): Command => ({ commands }) => {
        return commands.lift('blockquote')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Mod-9': () => this.editor.commands.toggleBlockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})

export default Blockquote

declare module '@tiptap/core' {
  interface AllExtensions {
    Blockquote: typeof Blockquote,
  }
}
