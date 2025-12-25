import { Toaster as ArkToaster, createToaster, Toast, useToastContext } from '@ark-ui/solid/toast'
import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from 'lucide-solid'
import { Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { createStyleContext, Stack, styled } from 'styled-system/jsx'
import { toast } from 'styled-system/recipes'
import { CloseButton } from './close-button'
import { Icon, type IconProps } from './icon'
import { Spinner } from './spinner'

const { withProvider, withContext } = createStyleContext(toast)

const Root = withProvider(Toast.Root, 'root')
const Title = withContext(Toast.Title, 'title')
const Description = withContext(Toast.Description, 'description')
const ActionTrigger = withContext(Toast.ActionTrigger, 'actionTrigger')
const CloseTrigger = withContext(Toast.CloseTrigger, 'closeTrigger')
const StyledToaster = styled(ArkToaster)

const iconMap: Record<string, any> = {
  warning: CircleAlertIcon,
  success: CheckCircleIcon,
  error: CircleXIcon,
}

const Indicator = (props: IconProps) => {
  const toast = useToastContext()

  const StatusIcon = () => iconMap[toast().type]

  return (
    <Show when={StatusIcon()}>
      {(IconComponent) => {
        const Icon_ = IconComponent; // Renamed to avoid shadowing the imported Icon component
        return (
          <Icon data-type={toast().type} {...props}>
            <Icon_ />
          </Icon>
        );
      }}
    </Show>
  )
}

export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
  overlap: true,
  max: 5,
})

export const Toaster = () => {
  return (
    <Portal>
      <StyledToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => (
          <Root>
            <Show when={toast().type === 'loading'} fallback={<Indicator />}>
              <Spinner color="colorPalette.plain.fg" />
            </Show>

            <Stack gap="3" alignItems="start">
              <Stack gap="1">
                <Show when={toast().title}>
                  <Title>{toast().title}</Title>
                </Show>
                <Show when={toast().description}>
                  <Description>{toast().description}</Description>
                </Show>
              </Stack>
              <Show when={toast().action}>
                {(action) => <ActionTrigger>{action().label}</ActionTrigger>}
              </Show>
            </Stack>
            <Show when={toast().closable}>
              <CloseTrigger>
                <CloseButton size="sm" />
              </CloseTrigger>
            </Show>
          </Root>
        )}
      </StyledToaster>
    </Portal>
  )
}

// Helper function for creating toasts
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface ToastOptions {
  type: ToastType
  title: string
  description?: string
}

export const addToast = (options: ToastOptions | ToastType, title?: string, description?: string) => {
  if (typeof options === 'object') {
    // オブジェクト形式
    toaster.create({
      title: options.title,
      description: options.description,
      type: options.type,
    })
  } else {
    // 個別引数形式（後方互換性のため）
    toaster.create({
      title: title!,
      description,
      type: options,
    })
  }
}
