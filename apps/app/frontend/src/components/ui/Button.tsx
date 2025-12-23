import { ark, type HTMLArkProps } from '@ark-ui/solid'
import { splitProps, type JSX } from 'solid-js'

export interface ButtonProps extends HTMLArkProps<'button'> {
    variant?: 'solid' | 'outline' | 'ghost' | 'link'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Button = (props: ButtonProps) => {
    const [local, rest] = splitProps(props, ['variant', 'size', 'class', 'children'])

    // Base styles matching Park UI premium feel
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

    const variants = {
        solid: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "border border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "underline-offset-4 hover:underline text-indigo-600",
    }

    const sizes = {
        xs: "h-7 px-3 text-xs",
        sm: "h-9 px-3",
        md: "h-10 py-2 px-4",
        lg: "h-11 px-8",
        xl: "h-12 px-10 text-lg",
    }

    const variantClass = variants[local.variant || 'solid']
    const sizeClass = sizes[local.size || 'md']

    return (
        <ark.button
            class={`${baseStyles} ${variantClass} ${sizeClass} ${local.class || ''}`}
            {...rest}
        >
            {local.children}
        </ark.button>
    )
}
