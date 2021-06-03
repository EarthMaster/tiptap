import { EditorView } from 'prosemirror-view'

export default function posToDOMRect(view: EditorView, from: number, to: number): DOMRect {
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to, -1)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const width = right - left
  const height = bottom - top
  const x = left
  const y = top
  const data = {
    top,
    bottom,
    left,
    right,
    width,
    height,
    x,
    y,
  }

  return {
    ...data,
    toJSON: () => data,
  }
}
