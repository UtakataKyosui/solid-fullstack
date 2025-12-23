import { ark } from '@ark-ui/solid/factory'
import type { ComponentProps } from 'solid-js'
import { styled } from 'styled-system/jsx'
import { spinner } from '@/theme/recipes'

export type SpinnerProps = ComponentProps<typeof Spinner>
export const Spinner = styled(ark.span, spinner)
