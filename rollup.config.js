// import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve'

export default {
	input: 'mixins/parent.js',
	external: ['electron', 'vue'],
	context: 'window',
	output: {
		dir: "dist",
		name: "VueExternalEvents",
		format: 'umd'
	},
	plugins: [ resolve() ]
}
