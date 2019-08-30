import OnExternal from './on-external'
import EmitExternal from './emit-external'
import { ExternalEventsMixin } from '../mixins/passive'

export function getDecorators(mixin: ExternalEventsMixin) {
	return {
		OnExternal: OnExternal(mixin),
		EmitExternal: EmitExternal(mixin)
	}
}

export { OnExternal, EmitExternal }
