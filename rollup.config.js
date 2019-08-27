// import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve'

const cjs = ['electron', 'passive', 'parent'].map(name => ({
	input: `es6/${name}.js`,
	external: ['electron', 'vue', 'vue-class-component'],
	context: 'window',
	output: {
		dir: "cjs",
		name: "VueExternalEvents",
		format: 'cjs'
	},
	plugins: [ resolve() ]
}))

const iife = ['passive', 'parent'].map(name => ({
	input: `es6/mixins/${name}.js`,
	external: ['vue'],
	context: 'window',
	output: {
		dir: "iife",
		name: "VueExternalEvents",
		format: 'iife',
		globals: { vue: 'Vue' }
	},
	plugins: [ resolve() ]
}))

export default [...cjs, ...iife]
