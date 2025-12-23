import { defineConfig } from "@pandacss/dev";
import { recipes, slotRecipes } from './src/theme/recipes';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Theme configuration with recipes
  theme: {
    extend: {
      recipes,
      slotRecipes,
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // JSX framework
  jsxFramework: "solid",
});