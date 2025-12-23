import { select } from "./select";
import { absoluteCenter } from './absolute-center'
import { button } from './button'
import { dialog } from './dialog'
import { group } from './group'
import { icon } from './icon'
import { input } from './input'
import { spinner } from './spinner'
import { toast } from './toast'

export { absoluteCenter }
export { button }
export { dialog }
export { group }
export { icon }
export { input }
export { spinner }
export { toast }

export const recipes = {
  absoluteCenter,
  button,
  group,
  icon,
  input,
  spinner,
  select
}

export const slotRecipes = {
  dialog,
  toast,
}