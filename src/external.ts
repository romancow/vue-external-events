import Vue from 'vue'
import * as Utilities from './utilities'

export default abstract class ExternalEventsMixin extends Vue {

	protected $ipcRenderer?: Electron.IpcRenderer

	abstract $onExternal(event: string | string[], callback: Function) : this

	abstract $onceExternal(event: string, callback: Function) : this

	abstract $offExternal(event?: string | string[], callback?: Function): this

	abstract $emitExternal(event: string, ...args: any[]): this

	beforeCreate() {
		const { $on, $once, $off, $emit } = this
		Utilities.Object.assign(this, {
			$on(this: ExternalEventsMixin, event: string | string[], callback: Function) {
				const { external, internal } = Utilities.VueEvent.separate(event)
				this.$onExternal(external, callback)
				if (internal != null) $on.call(this, internal, callback)
				return this
			},

			$once(this: ExternalEventsMixin, event: string, callback: Function) {
				const {
					external: [ext] = [undefined],
					internal
				} = Utilities.VueEvent.separate(event)
				if (ext != null) this.$onceExternal(ext, callback)
				if (internal != null) $once.call(this, internal, callback)
				return this
			},

			$off(this: ExternalEventsMixin, event?: string | string[], callback?: Function) {
				const { external = undefined, internal = undefined } = (event != null) ?
					Utilities.VueEvent.separate(event) : {}
				this.$offExternal(external, callback)
				if ((internal != null) || (event == null))
					$off.call(this, internal, callback)
				return this
			},

			$emit(this: ExternalEventsMixin, event: string, ...args: any[]) {
				if (Utilities.VueEvent.isExternal(event))
					this.$emitExternal(event, ...args)
				else
					$emit.call(this, event, ...args)
				return this
			}
		})
	}
}
