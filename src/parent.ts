import Mixin from './mixins/parent'
import { getDecorators } from './decorators'

const { OnExternal, EmitExternal } = getDecorators(Mixin)

export { Mixin, OnExternal, EmitExternal }
