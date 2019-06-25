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

}

namespace VueEvent {

	export function isExternal(event: string) {
		return _String.endsWith(event, '.external')
	}

	export function separate(event: string | string[]) {
		const { external = [], internal = [] } = _Array.groupBy(
			_Array.ensure(event),
			ev => isExternal(ev) ? 'external' : 'internal'
		)
		return {
			external: external.map(ev => ev.substring(0, ev.length - 9)),
			internal: (internal.length > 1) ? internal : internal[0]
		}
	}

}

export {
	_Array as Array,
	_String as String,
	_Object as Object,
	VueEvent
}
