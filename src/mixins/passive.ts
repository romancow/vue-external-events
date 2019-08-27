import Vue from 'vue'
import Component from 'vue-class-component'
import * as Utilities from '../utilities'

const VueEvent = Utilities.VueEvent
const DEFAULT_EXTERNAL_EVENT_NAMESPACE = 'external'

type OverriddenEventMethods = PassiveMixin &
	Record<'$on' | '$once' | '$off' | '$emit', Function & { internal: Function }>

const getEventMethodOverrides = () => {
	let namespace = Utilities.String.isString(PassiveMixin.namespace) ?
		PassiveMixin.namespace : DEFAULT_EXTERNAL_EVENT_NAMESPACE

	return {

		$on(this: OverriddenEventMethods, event: string | string[], callback: Function) {
			const { external, internal } = VueEvent.separate(event, namespace)
			this.$onExternal(external, callback)
			if (internal != null)
				this.$on.internal.call(this, internal, callback)
			return this
		},

		$once(this: OverriddenEventMethods, event: string, callback: Function) {
			const {
				external: [ext] = [undefined],
				internal
			} = VueEvent.separate(event, namespace)
			if (ext != null) this.$onceExternal(ext, callback)
			if (internal != null)
				this.$once.internal.call(this, internal, callback)
			return this
		},

		$off(this: OverriddenEventMethods, event?: string | string[], callback?: Function) {
			const { external = undefined, internal = undefined } = (event != null) ?
				VueEvent.separate(event, namespace) : {}
			this.$offExternal(external, callback)
			if ((internal != null) || (event == null))
				this.$off.internal.call(this, internal, callback)
			return this
		},

		$emit(this: OverriddenEventMethods, event: string, ...args: any[]) {
			if (VueEvent.isExternal(event, namespace))
				this.$emitExternal(VueEvent.removeNamespace(event), ...args)
			else
				this.$emit.internal.call(this, event, ...args)
			return this
		}
	} as OverriddenEventMethods
}


@Component
export default class PassiveMixin extends Vue {

	static namespace: string | boolean = false

	$onExternal(event: string | string[], callback: Function) {
		return this
	}

	$onceExternal(event: string, callback: Function) {
		return this
	}

	$offExternal(event?: string | string[], callback?: Function) {
		return this
	}

	$emitExternal(event: string, ...args: any[]) {
		return this
	}

	beforeCreate() {
		if (PassiveMixin.namespace) {
			const eventMethodOverrides = getEventMethodOverrides()
			Utilities.Object.forEach(eventMethodOverrides, (fn, method) => {
				fn['overridden'] = this[method]
				this[method] = fn
			})
		}
	}
}
