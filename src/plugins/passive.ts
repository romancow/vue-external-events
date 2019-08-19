import Vue from 'vue'
import * as Utilities from '../utilities'

declare module 'vue/types/vue' {
	interface Vue {
		$onExternal(event: string | string[], callback: Function): this
		$onceExternal(event: string, callback: Function): this
		$offExternal(event?: string | string[], callback?: Function): this
		$emitExternal(event: string, ...args: any[]): this
	}
}

type ExternalEventsPluginOptions = {
	namespace?: string | boolean
}

namespace ExternalEventsPluginOptions {
	export const defaultNamespace = 'external'
}

export default {

	namespace: ExternalEventsPluginOptions.defaultNamespace,

	install(vue: typeof Vue, { namespace = true }: ExternalEventsPluginOptions = {}) {
		const { prototype } = vue
		Utilities.Object.assign(prototype, this.instanceMethods)
		if (namespace) {
			if (namespace !== true) this.namespace = namespace
			Utilities.Object.select(prototype, [])
			this.override(prototype)
		}
	},

	on(events: string[], callback: Function) {},

	once(event: string, callback: Function) {},

	off(events?: string[], callback?: Function) {},

	emit(event: string, ...args: any[]) {},

	get instanceMethods() {
		const plugin = this
		const { on, once, off, emit } = this
		return {

			$onExternal(this: Vue, event: string | string[], callback: Function) {
				const events = Utilities.Array.ensure(event)
				on.call(plugin, events, callback)
				return this
			},

			$onceExternal(this: Vue, event: string, callback: Function) {
				once.call(plugin, event, callback)
				return this
			},

			$offExternal(this: Vue, event?: string | string[], callback?: Function) {
				const events = (event == null) ? undefined : Utilities.Array.ensure(event)
				off.call(plugin, events, callback)
				return this
			},

			$emitExternal(this: Vue, event: string, ...args: any[]) {
				emit.call(plugin, event, ...args)
				return this
			},
		}
	},

	get overrides() {
		const namespace = this.namespace
		const { $on, $once, $off, $emit } = prototype
		const { VueEvent } = Utilities
		return {
			$on(this: Vue, event: string | string[], callback: Function) {
				const { external, internal } = VueEvent.separate(event, namespace)
				this.$onExternal(external, callback)
				if (internal != null) $on.call(this, internal, callback)
				return this
			},
			$once(this: Vue, event: string, callback: Function) {
				if (VueEvent.isExternal(event, namespace)) {
					const extEvent = VueEvent.removeNamespace(event)
					this.$onceExternal(extEvent, callback)
				}
				else $once.call(this, event, callback)
				return this
			},
			$off(this: Vue, event?: string | string[], callback?: Function) {
				const { external = undefined, internal = undefined } = (event != null) ?
					VueEvent.separate(event, namespace) : {}
				this.$offExternal(external, callback)
				if ((internal != null) || (event == null))
					$off.call(this, internal, callback)
				return this
			},
			$emit(this: Vue, event: string, ...args: any[]) {
				if (VueEvent.isExternal(event, namespace)) {
					const extEvent = VueEvent.removeNamespace(event)
					this.$emitExternal(extEvent, ...args)
				}
				else $emit.call(this, event, ...args)
				return this
			}
		}
	},

	override(prototype: any) {
		const namespace = this.namespace
		const { $on, $once, $off, $emit } = prototype
		const { VueEvent } = Utilities
		const overrides = {
			$on(this: Vue, event: string | string[], callback: Function) {
				const { external, internal } = VueEvent.separate(event, namespace)
				this.$onExternal(external, callback)
				if (internal != null) $on.call(this, internal, callback)
				return this
			},
			$once(this: Vue, event: string, callback: Function) {
				if (VueEvent.isExternal(event, namespace)) {
					const extEvent = VueEvent.removeNamespace(event)
					this.$onceExternal(extEvent, callback)
				}
				else $once.call(this, event, callback)
				return this
			},
			$off(this: Vue, event?: string | string[], callback?: Function) {
				const { external = undefined, internal = undefined } = (event != null) ?
					VueEvent.separate(event, namespace) : {}
				this.$offExternal(external, callback)
				if ((internal != null) || (event == null))
					$off.call(this, internal, callback)
				return this
			},
			$emit(this: Vue, event: string, ...args: any[]) {
				if (VueEvent.isExternal(event, namespace)) {
					const extEvent = VueEvent.removeNamespace(event)
					this.$emitExternal(extEvent, ...args)
				}
				else $emit.call(this, event, ...args)
				return this
			}
		}
		Utilities.Object.assign(prototype, overrides)
		Utilities.Object.assign(this.override, { $on, $once, $off, $emit })
	},
	
	overridden: {}
}

export { ExternalEventsPluginOptions }
