import OnExternal from './on-external'
import EmitExternal from './emit-external'
import PassiveMixin from '../mixins/passive'

export function getDecorators(mixinType: typeof PassiveMixin) {
	return {
		OnExternal: OnExternal(mixinType),
		EmitExternal: EmitExternal(mixinType)
	}
}

export { OnExternal, EmitExternal }
