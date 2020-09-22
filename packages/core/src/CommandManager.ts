import { EditorState, Transaction } from "prosemirror-state";
import { ChainedCommands, Editor } from "./Editor";

export default class CommandManager {

  editor: Editor
  commands: { [key: string]: any } = {}

  constructor(editor: Editor, commands: any) {
    this.editor = editor
    this.commands = commands
  }

  public runSingleCommand(name: string) {
    const { commands, editor } = this
    const { state, view } = editor
    const command = commands[name]
    
    if (!command) {
      // TODO: prevent vue devtools to throw error
      // throw new Error(`tiptap: command '${name}' not found.`)
      return
    }
    
    return (...args: any) => {
      const { tr } = state

      const props = {
        editor: this.editor,
        state: this.chainableEditorState(tr, state),
        view,
        dispatch: () => false,
        // chain: this.chain.bind(this),
        tr,
      }

      Object.defineProperty(props, 'commands', {
        get: function() {
          return Object.fromEntries(Object
            .entries(commands)
            .map(([name, command]) => {
              return [name, (...args: any[]) => command(...args)(props)]
            }))
        }
      })

      const callback = command(...args)(props)

      view.dispatch(tr)

      return callback
    }
  }

  public createChain() {
    const { commands, editor } = this
    const { state, view } = editor
    const { tr } = state
    const callbacks: boolean[] = []

    return new Proxy({}, {
      get: (target, name: string, proxy) => {
        if (name === 'run') {
          view.dispatch(tr)

          return () => callbacks.every(callback => callback === true)
        }

        const command = commands[name]

        if (!command) {
          throw new Error(`tiptap: command '${name}' not found.`)
        }

        return (...args: any) => {
          const props = {
            editor: editor,
            state: this.chainableEditorState(tr, state),
            view: view,
            dispatch: () => false,
            // chain: this.chain.bind(this),
            tr,
          }

          // const self = this.editor
          Object.defineProperty(props, 'commands', {
            get: function() {
              return Object.fromEntries(Object
                .entries(commands)
                .map(([name, command]) => {
                  return [name, (...args: any[]) => command(...args)(props)]
                }))
            }
          });

          const callback = command(...args)(props)
          callbacks.push(callback)

          return proxy
        }
      }
    }) as ChainedCommands
  }

  public chainableEditorState(tr: Transaction, state: EditorState): EditorState {
    let selection = tr.selection
    let doc = tr.doc
    let storedMarks = tr.storedMarks

    return {
      ...state,
      schema: state.schema,
      plugins: state.plugins,
      apply: state.apply.bind(state),
      applyTransaction: state.applyTransaction.bind(state),
      reconfigure: state.reconfigure.bind(state),
      toJSON: state.toJSON.bind(state),
      get storedMarks() {
        return storedMarks
      },
      get selection() {
        return selection
      },
      get doc() {
        return doc
      },
      get tr() {
        selection = tr.selection
        doc = tr.doc
        storedMarks = tr.storedMarks

        return tr
      },
    };
  }

}