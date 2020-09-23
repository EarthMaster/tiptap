import { Schema } from 'prosemirror-model'

export default function getSchemaTypeByName(name: string, schema: Schema) {
  if (schema.nodes[name]) {
    return 'node'
  }

  if (schema.marks[name]) {
    return 'mark'
  }

  return null
}
