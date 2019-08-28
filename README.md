# vue-external-events
Vue mixin and decorators for sending & receiving \"external\" events (such as Electron inter-process communication or parent window messaging)

## Installation

Add a scope mapping for the GitHub npm package manager by adding a `.npmrc` file with the line:
```
@romancow:registry=https://npm.pkg.github.com/
```

Then install the package:
```
npm install @romancow/vue-external-events
```
or
```
yarn add @romancow/vue-external-events
```

More info on using the GitHub npm package registry [here](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#installing-a-package).

## Purpose

This package was created to make communicating with the main process in an Electron app from a Vue component in a renderer process easier and more Vue-like. It allows you to send and receive these message events in ways similar to normal Vue events.

Also, if you are writing code meant to run in both an Electron desktop app and in a browser, this package should make it easy to change this functionality between the two environments. Trying to send or receive  Electron renderer events is obviously gonna cause some issues in a browser.

### Why "external"?

The term "external" is used to describe what the Vue component is communicating with, rather than something like "Electron" or "main process" since it can be used to communicate to other "external" targets, such as an iframe's parent.

There are currently 3 different event targets suported:

<dl>
	<dt>electron</dt>
	<dd>Uses <code>ipcRenderer</code> to send and receive message events with the main Electron process.</dd>
	<dt>parent</dt>
	<dd>Uses <code>MessageEvent</code>s to communicate with the current window's parent window, like from within an iframe.</dd>
	<dt>passive</dt>
	<dd>Does nothing. Useful when you want to communicate with Electron in that context, but don't want it to do anything in a browser context without having to change any of your code.</dd>
</dl>

With webpack, you should be able to import the package normally (e.g. `import * as ExternalEvents from '@romancow/vue-external-events'`), and by default the "electron" version will be used if your target is `electron-renderer` and the "passive" version used if your target is `web`. This is set by the "module" and "browser" entries in the `package.json`, so hopefully other bundlers do somethign similar.

You can also import the version you want manually:
```javascript
import * as ExternalEvents from `@romancow/vue-external-events/es6/parent`
```

Or swap them out with an alias:
```javascript
module.exports = {
	/* your webpack config settings */

	resolve: {

		alias: {
			vue$: 'vue/dist/vue.esm.js',
			'@romancow/vue-external-events': '@romancow/vue-external-events/es6/parent'
		}
	}
}
```

## Usage

There are three different methods for sending and receiving these "external" events. You can use one, two, or all three of them.

### Mixin

Including the `vue-external-events` mixin with your Vue component will give it four new methods: `$onExternal`, `$onceExternal`, `$offExternal`, and `$emitExternal`. They work just like their Vue event method counterparts (`$on`, `$once`, `$off`, and `$emit`) except they listen/emit on the external target instead of the component.

```javascript
import { Mixin as ExternalEventsMixin } from '@romancow/vue-external-events'

var MyComponent = Vue.extend({
	mixins: [ExternalEventsMixin],
	methods: {
		save() {
			/* do saving stuff here... */
			this.$emitExternal('saved', /* your args here */)
		},
		delete() {
			/* do deleting stuff here.... */
			this.$emitExternal('deleted', /* your args here */)
		},
		doSomethingOnce() {
			/* the things to do... */
		}
	},
	created() {
		this.$onExternal('save', this.save)
		this.$onExternal('delete', this.delete)
		this.$onceExternal('do-thing', this.doSomethingOnce)
	}
})
```

If you are using the "parent" mixin, you can set the `targetOrigin` used for the `postMessage` call (default is `"*"`):
```javascript
import { Mixin as ExternalEventsMixin } from '@romancow/vue-external-events/es6/parent'

ExternalEventsMixin.targetOrigin = "https://secure.example.net"

var MyComponent = Vue.extend({
	mixins: [ExternalEventsMixin],
	// ...
})
```

### Decorators

If you are using TypeScript (or Babel) and class-style Vue components ([vue-class-component](https://github.com/vuejs/vue-class-component)), you can use the `OnExternal` and `EmitExternal` decorators.

`EmitExternal` works much the same way as the `Emit` decorator in the [Vue Property Decorator](https://github.com/kaorun343/vue-property-decorator#Emit) library.

`OnExternal` works similarly, calling the decorated method when an external event matching the "kebab-case" name of the method is received. You can also optionally supply the name of the event to listen for and/or a `{ once: true }` option to only trigger once.

```typescript
import Vue from 'vue'
import Component from 'vue-class-component'
import { OnExternal, EmitExternal } from '@romancow/vue-external-events'

@Component
export default class MyComponent extends Vue {

	@OnExternal()
	@EmitExternal('saved')
	save() {
		/* do saving stuff here... */
	}

	@OnExternal()
	@EmitExternal('deleted')
	delete() {
		/* do deleting stuff here.... */
	}

	@OnExternal('do-thing', { once: true })
	doSomethingOnce() {
		/* the things to do... */
	}
}
```

### Namespace

If you're using the mixin in your component, you can also specify an event "namespace" to use for external events, and then use the standard Vue event methods.

This method is turned off by default. To use it, set the mixin's `namespace` property to either `true` (to use the default namespace `"external"`) or a string to specify a custom namespace.

Then, to send an external event, just add this namespace after a `.` to the end of your event name:
```javascript
this.$emit('refresh.external')
```

A fuller example:

```javascript
import { Mixin as ExternalEventsMixin } from '@romancow/vue-external-events'

ExternalEventsMixin.namespace = true

var MyComponent = Vue.extend({
	mixins: [ExternalEventsMixin],
	methods: {
		save() {
			/* do saving stuff here... */
			this.$emit('saved.external', /* your args here */)
		},
		delete() {
			/* do deleting stuff here.... */
			this.$emit('deleted.external', /* your args here */)
		},
		doSomethingOnce() {
			/* the things to do... */
			this.$emit('did-something') // a non-external, "traditional" Vue event
		}
	},
	created() {
		this.$on('save.external', this.save)
		this.$on('delete.external', this.delete)
		this.$once('do-thing.external', this.doSomethingOnce)
	}
})
```

If you're using [Vue Property Decorators](https://github.com/kaorun343/vue-property-decorator), you can even use the external namespace with its `Emit` decorator:
```typescript
import { Component, Emit, Mixins } from 'vue-property-decorator'
import { Mixin as ExternalEventsMixin } from '@romancow/vue-external-events'

ExternalEventsMixin.namespace = 'electron'

@Component
export default class MyComponent extends Mixins(ExternalEventsMixin) {

	@Emit('input')
	inputChanged(input: string) {}

	@Emit('input.electron')
	electronInputChanged(input: string) {}

}
```

## Related
- [Electron](https://electronjs.org/)
- [Vue](https://vuejs.org/)
- [vue-class-component](https://github.com/vuejs/vue-class-component)
- [Vue Property Decorator](https://github.com/kaorun343/vue-property-decorator)

## License
[MIT](http://opensource.org/licenses/MIT)
