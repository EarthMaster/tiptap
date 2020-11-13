import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

export const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/gm
export const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/gm

const Code = createMark({
  name: 'code',

  excludes: '_',

  parseHTML() {
    return [
      { tag: 'code' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      code: (): Command => ({ commands }) => {
        return commands.toggleMark('code')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-`': () => this.editor.commands.code(),
    }
  },

  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})

export default Code

declare module '@tiptap/core' {
  interface AllExtensions {
    Code: typeof Code,
  }
}
