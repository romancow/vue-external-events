function polyfill<T extends any, F extends Function>(item: T, name: string, fn: F) {
	const existing = item[name]
	const callFn = (existing != null) && (existing instanceof Function) ? existing as F : fn
	return <unknown>(function (this: T, ...args: any[]) { return callFn.apply(this, args) }) as F
}

namespace _Array {

	export function ensure<T>(arr: T[] | T | null) {
		return (arr != null) ? Array.isArray(arr) ? arr : [arr] : []
	}

	export function groupBy<T, G extends string>(arr: T[], map: (item: T) => G) {
		return arr.reduce((grps, item) => {
			const grp = map(item)
			;(grps[grp] = grps[grp] || [])!.push(item)
			return grps
		}, {} as { [grp in G]?: T[] })
	}

}

namespace _String {

	export function endsWith(str: string, searchString: string) {
		const fn = polyfill(str, 'endsWith', (searchStr: string) => {
			const length = Math.max(str.length - searchStr.length, 0)
			return str.substring(length) === searchStr
		})
		return fn(searchString)
	}

	export function dasherize(str: string) {
		return str
			.split(/([A-Z][a-z\d]*)|[\W_]/)
			.filter(x => !!x)
			.join('-')
			.toLowerCase()
	}

	export function isString(str: any): str is string {
		return (typeof str === 'string')
	}

}

namespace _Object {

	export function assign(target: Object, source: Object) {
		const fn = polyfill(Object, 'assign', (trg: any, src: any) => {
			for (var key in src)
				trg[key] = src[key]
			return trg as Object
		})
		return fn(target, source)
	}

	export function select<T extends Object, K extends keyof T>(obj: T, keys: K[]) {
		const pick = {} as Pick<T, K>
		return keys.reduce((p, key) => (p[key] = obj[key], pick), pick)
	}

	export function forEach<T extends Object>(obj: T, fn: <K extends keyof T>(val: T[K], key: K, obj: T) => void) {
		Object.keys(obj).forEach((key: keyof T & string) => fn(obj[key], key, obj))
	}

}

namespace _Function {

	export function isFunction(fn: any): fn is Function {
		return (typeof fn === 'function')
	}

}

namespace _Promise {

	export function isPromise(promise: any): promise is { then: Function } {
		return (promise != null) && _Function.isFunction(promise.then)
	}

}

namespace _Symbol {

	export const isSupported = (typeof Symbol === 'function')
}

namespace VueEvent {

	export function isExternal(event: string, namespace: string) {
		return _String.endsWith(event, `.${namespace}`)
	}

	export function separate(event: string | string[], namespace: string) {
		const { external = [], internal = [] } = _Array.groupBy(
			_Array.ensure(event),
			ev => isExternal(ev, namespace) ? 'external' : 'internal'
		)
		return {
			external: external.map(ev => removeNamespace(ev)),
			internal: (internal.length > 1) ? internal : internal[0]
		}
	}

	export function removeNamespace(event: string) {
		const index = event.lastIndexOf('.')
		return (index > 0) ? event.substring(0, index) : event
	}

}

export {
	_Array as Array,
	_String as String,
	_Object as Object,
	_Function as Function,
	_Promise as Promise,
	_Symbol as Symbol,
	VueEvent
}
