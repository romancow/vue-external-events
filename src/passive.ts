import Vue from 'vue'
import Component from 'vue-class-component'
import * as Utilities from './utilities'

@Component
export default class PassiveMixin extends Vue {

	protected $ipcRenderer?: Electron.IpcRenderer

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
		const { $on, $once, $off, $emit } = this
		Utilities.Object.assign(this, {
			$on(this: PassiveMixin, event: string | string[], callback: Function) {
				const { external, internal } = Utilities.VueEvent.separate(event)
				this.$onExternal(external, callback)
				if (internal != null) $on.call(this, internal, callback)
				return this
			},

			$once(this: PassiveMixin, event: string, callback: Function) {
				const {
					external: [ext] = [undefined],
					internal
				} = Utilities.VueEvent.separate(event)
				if (ext != null) this.$onceExternal(ext, callback)
				if (internal != null) $once.call(this, internal, callback)
				return this
			},

			$off(this: PassiveMixin, event?: string | string[], callback?: Function) {
				const { external = undefined, internal = undefined } = (event != null) ?
					Utilities.VueEvent.separate(event) : {}
				this.$offExternal(external, callback)
				if ((internal != null) || (event == null))
					$off.call(this, internal, callback)
				return this
			},

			$emit(this: PassiveMixin, event: string, ...args: any[]) {
				if (Utilities.VueEvent.isExternal(event))
					this.$emitExternal(event, ...args)
				else
					$emit.call(this, event, ...args)
				return this
			}
		})
	}
}
