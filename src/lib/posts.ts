import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Billets publiés (hors brouillons), du plus récent au plus ancien. */
export async function getPublishedPosts(filter?: (post: Post) => boolean): Promise<Post[]> {
  return (await getCollection("blog"))
    .filter((p) => !p.data.draft && (!filter || filter(p)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postUrl = (post: Post) => `/posts/${post.id}/`;

/** Temps de lecture estimé en minutes (≈ 200 mots/min), sans les imports, balises et syntaxe Markdown. */
export function readingTime(post: Post): number {
  const text = (post.body ?? "")
    .replace(/^import .*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\]\([^)]*\)/g, " ")
    .replace(/[#*_>`[\]|-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatDate = (date: Date) =>
  date.toLocaleDateString("fr", { day: "numeric", month: "long", year: "numeric" });

/** Libellé du badge : « Billet mensuel » pour les billets tagués `mensuel`, sinon « Hors-série ». */
export const postKind = (post: Post) =>
  post.data.tags.includes("mensuel") ? "Billet mensuel" : "Hors-série";
