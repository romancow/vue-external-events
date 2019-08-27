import Mixin from './mixins/passive'
import { getDecorators } from './decorators'

const { OnExternal, EmitExternal } = getDecorators(Mixin)

export { Mixin, OnExternal, EmitExternal }
