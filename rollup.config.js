import pkg from './package.json';

export default {
	input: ['build/electron.js', 'build/parent.js'],
	external: ['electron', 'vue'],
	output: {
		dir: "dist",
		name: "VueExternalEvents",
		format: 'umd'
	}
}
