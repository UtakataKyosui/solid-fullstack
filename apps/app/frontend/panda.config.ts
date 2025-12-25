import { defineConfig } from "@pandacss/dev";
import { recipes, slotRecipes } from './src/theme/recipes';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Custom conditions for theme switching
  conditions: {
    extend: {
      light: '&.light, .light &',
      dark: '&.dark, .dark &',
    },
  },

  // Theme configuration with recipes
  theme: {
    extend: {
      recipes,
      slotRecipes,
      semanticTokens: {
        colors: {
          // Foreground (text) colors
          fg: {
            default: {
              value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' },
            },
            muted: {
              value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
            },
            subtle: {
              value: { base: '{colors.gray.500}', _dark: '{colors.gray.500}' },
            },
          },
          // Background colors
          bg: {
            canvas: {
              value: { base: 'white', _dark: '{colors.gray.950}' },
            },
            default: {
              value: { base: 'white', _dark: '{colors.gray.900}' },
            },
            subtle: {
              value: { base: '{colors.gray.50}', _dark: '{colors.gray.800}' },
            },
            muted: {
              value: { base: '{colors.gray.100}', _dark: '{colors.gray.800}' },
            },
          },
          // Border colors
          border: {
            default: {
              value: { base: '{colors.gray.200}', _dark: '{colors.gray.800}' },
            },
            muted: {
              value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' },
            },
          },
          // Error color (purple)
          error: {
            value: { base: '{colors.purple.700}', _dark: '{colors.purple.400}' },
          },
          // Color palette for buttons (default gray palette)
          colorPalette: {
            solid: {
              bg: {
                value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' },
                hover: { value: { base: '{colors.gray.800}', _dark: '{colors.gray.200}' } },
              },
              fg: {
                value: { base: 'white', _dark: '{colors.gray.900}' },
              },
            },
            outline: {
              border: {
                value: { base: '{colors.gray.300}', _dark: '{colors.gray.700}' },
              },
              fg: {
                value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' },
              },
              bg: {
                hover: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.800}' } },
                active: { value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' } },
              },
            },
            subtle: {
              bg: {
                value: { base: '{colors.gray.100}', _dark: '{colors.gray.800}' },
                hover: { value: { base: '{colors.gray.200}', _dark: '{colors.gray.700}' } },
                active: { value: { base: '{colors.gray.300}', _dark: '{colors.gray.600}' } },
              },
              fg: {
                value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' },
              },
            },
            surface: {
              bg: {
                value: { base: 'white', _dark: '{colors.gray.900}' },
                active: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.800}' } },
              },
              border: {
                value: { base: '{colors.gray.200}', _dark: '{colors.gray.800}' },
                hover: { value: { base: '{colors.gray.300}', _dark: '{colors.gray.700}' } },
              },
              fg: {
                value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' },
              },
            },
            plain: {
              fg: {
                value: { base: '{colors.gray.900}', _dark: '{colors.gray.100}' },
              },
              bg: {
                hover: { value: { base: '{colors.gray.50}', _dark: '{colors.gray.800}' } },
                active: { value: { base: '{colors.gray.100}', _dark: '{colors.gray.700}' } },
              },
            },
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // JSX framework
  jsxFramework: "solid",
});