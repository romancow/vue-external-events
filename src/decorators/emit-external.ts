import Vue from 'vue'
import PassiveMixin from '../mixins/passive'
import * as Utilities from '../utilities'

export default function EmitExternal(mixin: typeof PassiveMixin) {
	const { $emitExternal } = mixin.prototype
	return function (event?: string) {
		return function (target: Vue, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
			const channel = event || Utilities.String.dasherize(propertyKey)
			const fn = descriptor.value!
			descriptor.value = function(...args: any[]) {
				const emit = (result: any) => {
					if (result !== undefined) args.unshift(result)
					$emitExternal.call(target, channel, ...args)
				}
				const fnResult = fn.apply(this, args)
				if (Utilities.Promise.isPromise(fnResult))
					fnResult.then(emit)
				else emit(fnResult)
			}
		} as MethodDecorator
	}
}
