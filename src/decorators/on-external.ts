import Vue from 'vue'
import { ExternalEventsMixin } from '../mixins/passive'
import * as Utilities from '../utilities'

type OnExternalOptions = { once?: boolean }
type OnExternalDecoratorFn =
	((options?: OnExternalOptions) => MethodDecorator) |
	((event?: string, options?: OnExternalOptions) => MethodDecorator)

export default function OnExternal(mixin: ExternalEventsMixin) {
	const { $onExternal, $onceExternal } = mixin.options.methods!
	return function (event?: string | OnExternalOptions, options?: OnExternalOptions) {
		const [ev, opts = {}] = Utilities.String.isString(event) ?
			[event, options] : [undefined, event]
		const fn = opts.once ? $onceExternal : $onExternal

		return function (target: Vue, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
			const channel = ev || Utilities.String.dasherize(propertyKey)
			fn.call(target as any, channel, descriptor.value!)
		}
	} as OnExternalDecoratorFn
}
