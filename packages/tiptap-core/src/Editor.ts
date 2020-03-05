import {EditorState, TextSelection, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser, DOMSerializer} from "prosemirror-model"
// @ts-ignore
import {schema} from "prosemirror-schema-basic"
// @ts-ignore
import {addListNodes} from "prosemirror-schema-list"
// @ts-ignore
import {exampleSetup} from "prosemirror-example-setup" 

import elementFromString from './utils/elementFromString'
import injectCSS from './utils/injectCSS'

type EditorContent = string | JSON

interface Options {
  element?: Node
  content: EditorContent
  extensions: [any?]
  injectCSS: Boolean
}

export class Editor {

  private lastCommand = Promise.resolve()

  private schema: Schema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
  })
  
  selection = { from: 0, to: 0 }

  view: EditorView

  options: Options = {
    content: '',
    injectCSS: true,
    extensions: [],
  }

  constructor(options: Options) {
    this.options = { ...this.options, ...options }
    this.view = this.createView()
    this.registerCommand('focus', require('./commands/focus').default)
    this.registerCommand('insertText', require('./commands/insertText').default)
    this.registerCommand('insertHTML', require('./commands/insertHTML').default)

    if (this.options.injectCSS) {
      injectCSS(require('./style.css'))
    }
  }

  get state() {
    return this.view.state
  }

  private createState() {
    return EditorState.create({
      doc: this.createDocument(this.options.content),
      plugins: [
        ...exampleSetup({schema: this.schema}),
      ],
    })
  }

  private createView() {
    return new EditorView(this.options.element, {
      state: this.createState(),
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })
  }

  private chainCommand = (method: Function) => (...args: any) => {
    this.lastCommand = this.lastCommand
      .then(() => method.apply(this, args))
      .catch(console.error)

    return this
  }

  private createDocument(content: EditorContent, parseOptions: any = {}): any {
    // if (content === null) {
    //   return this.schema.nodeFromJSON(this.options.emptyDocument)
    // }

    // if (typeof content === 'object') {
    //   try {
    //     return this.schema.nodeFromJSON(content)
    //   } catch (error) {
    //     console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)
    //     return this.schema.nodeFromJSON(this.options.emptyDocument)
    //   }
    // }

    if (typeof content === 'string') {
      return DOMParser
        .fromSchema(this.schema)
        .parse(elementFromString(content), parseOptions)
    }

    return false
  }

  public setContent(content: EditorContent = '', emitUpdate: Boolean = false, parseOptions: any = {}) {
    const { doc, tr } = this.state
    const document = this.createDocument(content, parseOptions)
    const selection = TextSelection.create(doc, 0, doc.content.size)
    const transaction = tr
      .setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate)

    this.view.dispatch(transaction)

    return this
  }

  private dispatchTransaction(transaction: any): void {
    const state = this.state.apply(transaction)
    this.view.updateState(state)

    const { from, to } = this.state.selection
    this.selection = { from, to }

    // this.setActiveNodesAndMarks()

    // this.emit('transaction', {
    //   getHTML: this.getHTML.bind(this),
    //   getJSON: this.getJSON.bind(this),
    //   state: this.state,
    //   transaction,
    // })
    
    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return
    }

    // this.emitUpdate(transaction)
  }

  public registerCommand(name: string, method: Function): Editor {
    // @ts-ignore
    this[name] = this.chainCommand((...args: any) => {
      return new Promise(resolve => {
        return method(resolve, this, ...args)
      })
    })

    return this
  }

  public command(name: string, ...args: any) {
    // @ts-ignore
    return this[name](...args)
  }

  public json() {
    return this.state.doc.toJSON()
  }

  public html() {
    const div = document.createElement('div')
    const fragment = DOMSerializer
      .fromSchema(this.schema)
      .serializeFragment(this.state.doc.content)

    div.appendChild(fragment)

    return div.innerHTML
  }

  public destroy() {
    if (!this.view) {
      return
    }

    this.view.destroy()
  }
  
}
