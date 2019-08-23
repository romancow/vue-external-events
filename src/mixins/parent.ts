import Component from 'vue-class-component'
import * as Utilities from '../utilities'
import PassiveMixin from './passive'

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

const LISTENERS_KEY: unique symbol = <any>(Utilities.Symbol.isSupported ? Symbol(' _eventsExternal') : ' _eventsExternal')
const messageListenerOptions = { capture: false, passive: true }


@Component
export default class ParentMixin extends PassiveMixin {

	static targetOrigin = '*'
	private [LISTENERS_KEY]: ExternalEvents

	$onExternal(event: string | string[], callback: Function) {
		const listeners = this[LISTENERS_KEY]
		Utilities.Array.ensure(event)
			.forEach(channel => ExternalEvents.add(listeners, channel, callback))
		return this
	}

	$onceExternal(event: string, callback: Function) {
		const listeners = this[LISTENERS_KEY]
		ExternalEvents.add(listeners, event, callback, true)
		return this
	}

	$offExternal(event?: string | string[], callback?: Function) {
		const listeners = this[LISTENERS_KEY]
		if (event == null)
			listeners.channels = {}
		else {
			const { channels } = listeners
			Utilities.Array.ensure(event).forEach(channel =>
				channels[channel] = (callback == null) ? [] :
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

