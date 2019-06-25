import { ipcRenderer } from 'electron'
import Component from 'vue-class-component'
import ExternalEventsMixin from './external'
import * as Utilities from './utilities'

@Component
export default class ElectronMixin extends ExternalEventsMixin {

	protected $ipcRenderer = ipcRenderer

	$onExternal(event: string | string[], callback: Function) {
		Utilities.Array.ensure(event)
			.forEach(ev => ipcRenderer.on(ev, callback))
		return this
	}

	$onceExternal(event: string, callback: Function) {
		ipcRenderer.once(event, callback)
		return this
	}

	$offExternal(event?: string | string[], callback?: Function) {
		if (event == null)
			ipcRenderer.removeAllListeners()
		else {
			const remover = (callback == null) ?
				(ev: string) => ipcRenderer.removeAllListeners(ev) :
				(ev: string) => ipcRenderer.removeListener(ev, callback)
			Utilities.Array.ensure(event).forEach(remover)
		}
		return this
	}

	$emitExternal(event: string, ...args: any[]) {
		ipcRenderer.send(event, ...args)
		return this
	}
}
