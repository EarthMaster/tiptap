import { Node } from 'tiptap'
import { setBlockType, textblockTypeInputRule, toggleBlockType } from 'tiptap-commands'

export default class Heading extends Node {

	get name() {
		return 'heading'
	}

	get defaultOptions() {
		return {
			levels: [1, 2, 3, 4, 5, 6],
		}
	}

	get schema() {
		return {
			attrs: {
				level: {
					default: 1,
				},
			},
			content: 'inline*',
			group: 'block',
			defining: true,
			draggable: false,
			parseDOM: this.options.levels.map(level => ({ tag: `h${level}`, attrs: { level } })),
			toDOM: node => [`h${node.attrs.level}`, 0],
		}
	}

	command({ type, schema, attrs }) {
		return toggleBlockType(type, schema.nodes.paragraph, attrs)
	}

	keys({ type }) {
		return this.options.levels.reduce((items, level) => ({
			...items,
			...{
				[`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
			},
		}), {})
	}

	inputRules({ type }) {
		return this.options.levels.map(level => {
			return textblockTypeInputRule(
				new RegExp(`^(#{1,${level}})\\s$`),
				type,
				match => ({ level }),
			)
		})


		return [
			textblockTypeInputRule(
				new RegExp(`^(#{1,${this.options.levels}})\\s$`),
				type,
				match => ({ level: match[1].length }),
			),
		]
	}

}
