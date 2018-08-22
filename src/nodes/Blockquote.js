import { Node } from '../utils'
import { wrappingInputRule, setBlockType, wrapIn } from '../helpers'

export default class BlockquoteNode extends Node {

	get name() {
		return 'blockquote'
	}

	get schema() {
		return {
			content: 'block+',
			group: 'block',
			defining: true,
			draggable: false,
			parseDOM: [
				{ tag: 'blockquote' },
			],
			toDOM: () => ['blockquote', 0],
		}
	}

	command({ type }) {
		return setBlockType(type)
	}

	keys({ type }) {
		return {
			'Ctrl->': wrapIn(type),
		}
	}

	inputRules({ type }) {
		return [
			wrappingInputRule(/^\s*>\s$/, type),
		]
	}

}
