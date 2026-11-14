// Import the glob loader
import { file, glob } from "astro/loaders";
// Import utilities from `astro:content`
import { defineCollection, reference } from "astro:content";
// Import Zod
import { z } from "astro/zod";
// Define a `loader` and `schema` for each collection
const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md?(x)', base: "./src/blog/posts" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }).optional(),
      tags: z.array(z.string()),
      draft: z.boolean().default(false),
      /** Mis en avant dans la bande « À la une » de l'accueil (le plus récent l'emporte). */
      featured: z.boolean().default(false)
    })
});

// Fiches : un JSON (tableau) pour people et publishers, un .md par jeu (id = nom du fichier).
const people = defineCollection({
  loader: file("./src/data/people.json"),
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

const publishers = defineCollection({
  loader: file("./src/data/publishers.json"),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

const games = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/games" }),
  schema: z.object({
    name: z.string(),
    /** Boîte du jeu (URL). Facultative : un visuel dé + cartes la remplace si absente. */
    image: z.string().url().optional(),
    description: z.string().optional(),
    /** Jeu de base si c'est une extension ou une suite. */
    parent: reference("games").optional(),
    kind: z.enum(["jeu", "extension", "suite"]).default("jeu"),
    /** Affiché dans « Nos jeux du moment » sur l'accueil. */
    playingNow: z.boolean().default(false),
    players: z.string().optional(),
    age: z.string().optional(),
    duration: z.string().optional(),
    mechanics: z.array(z.string()).default([]),
    authors: z.array(reference("people")).default([]),
    artists: z.array(reference("people")).default([]),
    publisher: reference("publishers").optional(),
    distributor: reference("publishers").optional(),
    price: z.string().optional(),
    /** Liens d'achat : { shop: "philibert", url: "https://…" }. Vide pour l'instant. */
    shops: z
      .array(z.object({ shop: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = { blog, people, publishers, games };