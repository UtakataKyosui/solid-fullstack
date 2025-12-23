import { Dialog as ArkDialog, useDialogContext } from '@ark-ui/solid/dialog'
import { ark } from '@ark-ui/solid/factory'
import type { ComponentProps } from 'solid-js'
import { createStyleContext, styled } from 'styled-system/jsx'
import { dialog } from '@/theme/recipes'

const { withRootProvider, withContext } = createStyleContext(dialog)

export type RootProps = ComponentProps<typeof Root>
export const Root = withRootProvider(ArkDialog.Root, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
})
export const RootProvider = withRootProvider(ArkDialog.RootProvider, {
  defaultProps: () => ({ unmountOnExit: true, lazyMount: true }),
})
export const Backdrop = withContext(ArkDialog.Backdrop, 'backdrop')
export const CloseTrigger = withContext(ArkDialog.CloseTrigger, 'closeTrigger')
export const Content = withContext(ArkDialog.Content, 'content')
export const Description = withContext(ArkDialog.Description, 'description')
export const Positioner = withContext(ArkDialog.Positioner, 'positioner')
export const Title = withContext(ArkDialog.Title, 'title')
export const Trigger = withContext(ArkDialog.Trigger, 'trigger')
export const Body = withContext(ark.div, 'body')
export const Header = withContext(ark.div, 'header')
export const Footer = withContext(ark.div, 'footer')

const StyledButton = styled(ark.button)

export const ActionTrigger = (props: ComponentProps<typeof StyledButton>) => {
  const dialog = useDialogContext()

  return <StyledButton {...props} onClick={() => dialog().setOpen(false)} />
}

export { DialogContext as Context } from '@ark-ui/solid/dialog'

// Export all as Dialog namespace
export const Dialog = {
  Root,
  RootProvider,
  Backdrop,
  CloseTrigger,
  Content,
  Description,
  Positioner,
  Title,
  Trigger,
  Body,
  Header,
  Footer,
  ActionTrigger,
}
