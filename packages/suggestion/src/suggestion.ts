import { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { findSuggestionMatch } from './findSuggestionMatch'
import { getVirtualNode } from './getVirtualNode'

export interface SuggestionOptions {
  editor: Editor,
  char?: string,
  allowSpaces?: boolean,
  startOfLine?: boolean,
  suggestionClass?: string,
  command?: (props: any) => any,
  items?: (query: string) => any[],
  render?: () => {
    onStart?: (props: any) => void,
    onUpdate?: (props: any) => void,
    onExit?: (props: any) => void,
    onKeyDown?: (props: any) => boolean,
  },
}

export function Suggestion({
  char = '@',
  allowSpaces = false,
  startOfLine = false,
  suggestionClass = 'suggestion',
  command = () => null,
  items = () => [],
  render = () => ({}),
}: SuggestionOptions) {

  const renderer = render?.()

  return new Plugin({
    key: new PluginKey('suggestions'),

    view() {
      return {
        update: async (view, prevState) => {
          const prev = this.key?.getState(prevState)
          const next = this.key?.getState(view.state)

          // See how the state changed
          const moved = prev.active && next.active && prev.range.from !== next.range.from
          const started = !prev.active && next.active
          const stopped = prev.active && !next.active
          const changed = !started && !stopped && prev.query !== next.query
          const handleStart = started || moved
          const handleChange = changed && !moved
          const handleExit = stopped || moved

          // Cancel when suggestion isn't active
          if (!handleStart && !handleChange && !handleExit) {
            return
          }

          const state = handleExit ? prev : next
          const decorationNode = document.querySelector(`[data-decoration-id="${state.decorationId}"]`)
          const props = {
            view,
            range: state.range,
            query: state.query,
            text: state.text,
            items: (handleChange || handleStart)
              ? await items(state.query)
              : [],
            command: () => {
              command({ range: state.range })
            },
            decorationNode,
            // build a virtual node for popper.js or tippy.js
            // this can be used for building popups without a DOM node
            virtualNode: decorationNode
              ? getVirtualNode(decorationNode)
              : null,
          }

          if (handleStart) {
            renderer?.onStart?.(props)
          }

          if (handleChange) {
            renderer?.onUpdate?.(props)
          }

          if (handleExit) {
            renderer?.onExit?.(props)
          }
        },
      }
    },

    state: {
      // Initialize the plugin's internal state.
      init() {
        return {
          active: false,
          range: {},
          query: null,
          text: null,
        }
      },

      // Apply changes to the plugin state from a view transaction.
      apply(transaction, prev) {
        const { selection } = transaction
        const next = { ...prev }

        // We can only be suggesting if there is no selection
        if (selection.from === selection.to) {
          // Reset active state if we just left the previous suggestion range
          if (selection.from < prev.range.from || selection.from > prev.range.to) {
            next.active = false
          }

          // Try to match against where our cursor currently is
          const match = findSuggestionMatch({
            char,
            allowSpaces,
            startOfLine,
            $position: selection.$from,
          })
          const decorationId = `id_${Math.floor(Math.random() * 0xFFFFFFFF)}`

          // If we found a match, update the current state to show it
          if (match) {
            next.active = true
            next.decorationId = prev.decorationId ? prev.decorationId : decorationId
            next.range = match.range
            next.query = match.query
            next.text = match.text
          } else {
            next.active = false
          }
        } else {
          next.active = false
        }

        // Make sure to empty the range if suggestion is inactive
        if (!next.active) {
          next.decorationId = null
          next.range = {}
          next.query = null
          next.text = null
        }

        return next
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const { active, range } = this.getState(view.state)

        if (!active) {
          return false
        }

        return renderer?.onKeyDown?.({ view, event, range }) || false
      },

      // Setup decorator on the currently active suggestion.
      decorations(state) {
        const { active, range, decorationId } = this.getState(state)

        if (!active) {
          return null
        }

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: 'span',
            class: suggestionClass,
            'data-decoration-id': decorationId,
          }),
        ])
      },
    },
  })
}
