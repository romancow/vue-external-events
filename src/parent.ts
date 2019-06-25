import Component from 'vue-class-component'
import ExternalEventsMixin from './external'
import * as Utilities from './utilities'

type ExternalEventsMessageData = { channel: string, args?: any[] }
type ExternalEvents = {
	listener(ev: MessageEvent): void
	channels: {
		[channel: string]: {
			callback: Function
			once?: boolean
		}[]
	}
}

namespace ExternalEvents {
	export function add({ channels }: ExternalEvents, channel: string, callback: Function, once: boolean = false) {
		let items = channels[channel]
		if (items == null) items = channels[channel] = []
		items.push({ callback, once })
	}
}

const LISTENERS_KEY = ((typeof Symbol !== 'function') ? '_eventsExternal' : Symbol('_eventsExternal')) as '_eventsExternal'
const messageListenerOptions = { capture: false, passive: true }


@Component
export default class ParentMixin extends ExternalEventsMixin {

	static targetOrigin = '*'

	private [LISTENERS_KEY]: ExternalEvents

	$onExternal(event: string | string[], callback: Function) {
		Utilities.Array.ensure(event)
			.forEach(channel => ExternalEvents.add(this[LISTENERS_KEY], channel, callback))
		return this
	}

	$onceExternal(event: string, callback: Function) {
		Utilities.Array.ensure(event)
			.forEach(channel => ExternalEvents.add(this[LISTENERS_KEY], channel, callback, true))
		return this
	}

	$offExternal(event?: string | string[], callback?: Function) {
		const externalEvents = this[LISTENERS_KEY]
		if (event == null)
			externalEvents.channels = {}
		else {
			const { channels } = externalEvents
			const all = (callback == null)
			Utilities.Array.ensure(event).forEach(channel =>
				channels[channel] = all ? [] :
					channels[channel].filter(({callback: cb}) => cb != callback)
			)
		}
		return this
	}

	$emitExternal(event: string, ...args: any[]) {
		const message: ExternalEventsMessageData = { channel: event, args }
		window.parent.postMessage(message, ParentMixin.targetOrigin)
		return this
	}

	created() {
		const { listener } = this[LISTENERS_KEY] = {
			listener: (ev: MessageEvent) => {
				const { channels } = this[LISTENERS_KEY]
				const { channel, args } = ev.data as ExternalEventsMessageData
				const listeners = channels[channel] || []
				listeners.forEach(({ callback }) => callback.apply(this, args))
				const hasOnce = listeners.some(({ once = false }) => once)
				if (hasOnce) channels[channel] = listeners.filter(({ once }) => !once)
			},
			channels: {}
		}
		window.parent.addEventListener('message', listener, messageListenerOptions)
	}

	destroyed() {
		const { listener } = this[LISTENERS_KEY]
		window.parent.removeEventListener('message', listener, messageListenerOptions)
	}
}
