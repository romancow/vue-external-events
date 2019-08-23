import Vue from 'vue'
import PassiveMixin from '../mixins/passive'
import * as Utilities from '../utilities'

type OnExternalOptions = { once?: boolean }
type OnExternalMethodDecorator = (target: Vue, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => void
type OnExternalDecoratorFactory =
	((options?: OnExternalOptions) => OnExternalMethodDecorator) |
	((event?: string, options?: OnExternalOptions) => OnExternalMethodDecorator)

export function OnExternal(mixin: typeof PassiveMixin) {
	const { $onExternal, $onceExternal } = mixin.prototype
	return function (event?: string | OnExternalOptions, options?: OnExternalOptions) {
		const [ev, opts = {}] = Utilities.String.isString(event) ?
			[event, options] : [undefined, event]
		const fn = opts.once ? $onceExternal : $onExternal

		return function (target: Vue, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
			const channel = ev || Utilities.String.dasherize(propertyKey)
			fn.call(target, channel, descriptor.value!)
		}
	} as OnExternalDecoratorFactory
}
