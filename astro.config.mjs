// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://journal-de-brojira.netlify.app/",
  integrations: [svelte(), mdx()],

  // Images distantes (billets, fiches de jeux) : téléchargées au build et converties en WebP par <Image>.
  image: {
    remotePatterns: [{ protocol: "https" }],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});