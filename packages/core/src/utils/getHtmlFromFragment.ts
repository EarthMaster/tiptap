import { Node as ProseMirrorNode, DOMSerializer } from 'prosemirror-model'
import { Schema } from 'prosemirror-model'

export default function getHtmlFromFragment(doc: ProseMirrorNode, schema: Schema): string {
  const fragment = DOMSerializer
    .fromSchema(schema)
    .serializeFragment(doc.content)

  const temporaryDocument = document.implementation.createHTMLDocument()
  const container = temporaryDocument.createElement('div')
  container.appendChild(fragment)

  return container.innerHTML
}
