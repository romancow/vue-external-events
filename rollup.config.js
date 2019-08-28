// import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const plugins = [ resolve(), terser() ]

export default ['electron', 'parent', 'passive'].map(name => ({
	input: `es6/mixins/${name}.js`,
	external: ['electron', 'vue'],
	context: 'window',
	output: {
		file: `umd/vue-external-events.${name}.js`,
		name: "VueExternalEvents",
		format: 'umd',
		globals: { vue: 'Vue', electron: 'electron' },
		sourcemap: true,
		sourcemapExcludeSources: true
	},
	plugins
}))
