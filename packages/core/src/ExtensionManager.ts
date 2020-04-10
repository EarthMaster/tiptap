import collect from 'collect.js'
import { keymap } from 'prosemirror-keymap'
import { inputRules } from 'prosemirror-inputrules'
import { Editor, CommandSpec } from './Editor'
import Extension from './Extension'
import Node from './Node'

export default class ExtensionManager {

  editor: Editor
  extensions: (Extension | Node)[]

  constructor(extensions: (Extension | Node)[], editor: Editor) {
    this.editor = editor
    this.extensions = extensions
    this.extensions.forEach(extension => {
      extension.bindEditor(editor)
      editor.on('schemaCreated', () => {
        this.registerCommands(extension.commands())
        extension.created()
      })
    })
  }

  registerCommands(commands: CommandSpec) {
    Object
      .entries(commands)
      .forEach(([name, command]) => {
        this.editor.registerCommand(name, command)
      })
  }

  get topNode() {
    const topNode = collect(this.extensions).firstWhere('topNode', true)

    if (topNode) {
      return topNode.name
    }
  }

  get nodes(): any {
    return collect(this.extensions)
      .where('extensionType', 'node')
      .mapWithKeys((extension: any) => [extension.name, extension.schema()])
      .all()
  }

  get marks(): any {
    return collect(this.extensions)
      .where('extensionType', 'mark')
      .mapWithKeys((extension: any) => [extension.name, extension.schema()])
      .all()
  }

  get plugins(): any {
    const plugins = collect(this.extensions)
      .flatMap(extension => extension.plugins())
      .toArray()

    return [
      ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules(): any {
    return collect(this.extensions)
      .flatMap(extension => extension.inputRules())
      .toArray()
  }

  get pasteRules(): any {
    return collect(this.extensions)
      .flatMap(extension => extension.pasteRules())
      .toArray()
  }

  get keymaps() {
    return collect(this.extensions)
      .map(extension => extension.keys())
      .filter(keys => !!Object.keys(keys).length)
      .map(keys => keymap(keys))
      .toArray()
  }

}
