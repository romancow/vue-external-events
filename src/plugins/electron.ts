import { ipcRenderer } from 'electron'
import PassiveExternalEventsPlugin from './passive'
import * as Utilities from '../utilities'


export default class ElectronExternalEventsPlugin extends PassiveExternalEventsPlugin {
	on(events: string[], callback: Function) {
		events.forEach(ev => ipcRenderer.on(ev, callback))
	},
	once(event: string, callback: Function) {
		ipcRenderer.once(event, callback)
	},
	off(events?: string[], callback?: Function) {
		if (events == null)
			ipcRenderer.removeAllListeners(undefined as any)
		else {
			const remover = (callback == null) ?
				(ev: string) => ipcRenderer.removeAllListeners(ev) :
				(ev: string) => ipcRenderer.removeListener(ev, callback)
			events.forEach(remover)
		}
	},
	emit(event: string, ...args: any[]) {
		ipcRenderer.send(event, ...args)
	}
})

// export class ElectronMixin extends PassiveMixin {

// 	protected $ipcRenderer = ipcRenderer

// 	static $externalEventsHandler: ExternalEventsHandler = {
// 		on(events: string[], callback: Function) {
// 			events.forEach(ev => ipcRenderer.on(ev, callback))
// 		},
// 		once(event: string, callback: Function) {
// 			ipcRenderer.once(event, callback)
// 		},
// 		off(events?: string[], callback?: Function) {
// 			if (events == null)
// 				ipcRenderer.removeAllListeners(undefined as any)
// 			else {
// 				const remover = (callback == null) ?
// 					(ev: string) => ipcRenderer.removeAllListeners(ev) :
// 					(ev: string) => ipcRenderer.removeListener(ev, callback)
// 				events.forEach(remover)
// 			}
// 		},
// 		emit(event: string, ...args: any[]) {
// 			ipcRenderer.send(event, ...args)
// 		}
// 	}
// }
