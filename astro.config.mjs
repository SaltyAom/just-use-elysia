// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import { rendererClassic, transformerTwoslash } from "@shikijs/twoslash";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        dark: "catppuccin-macchiato",
        light: "catppuccin-latte",
      },
      transformers: [
        transformerTwoslash({
          renderer: rendererClassic(),
        }),
      ],
    },
  },
});
