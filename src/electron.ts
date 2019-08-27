import Mixin from './mixins/electron'
import { getDecorators } from './decorators'

const { OnExternal, EmitExternal } = getDecorators(Mixin)

export { Mixin, OnExternal, EmitExternal }
