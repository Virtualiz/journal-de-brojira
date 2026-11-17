/**
 * « Cité dans le journal » : billets publiés qui mentionnent une fiche.
 * Les mentions sont lues dans le MDX des billets : <GameLink id>, <GameCard id>, <GameList ids>,
 * <PersonLink id>, <PublisherLink id> (les commentaires {/* … *\/} sont ignorés).
 * Rien à déclarer dans le frontmatter : utiliser les composants suffit.
 */
import type { CollectionEntry } from "astro:content";
import { getPublishedPosts, type Post } from "./posts";

type FicheCollection = "games" | "people" | "publishers";
export type Mentions = Record<FicheCollection, Set<string>>;

const BY_COMPONENT: Record<string, FicheCollection> = {
  GameLink: "games",
  GameCard: "games",
  PersonLink: "people",
  PublisherLink: "publishers",
};

/** Ids des fiches mentionnées dans le source MDX d'un billet. */
export function findMentions(body: string): Mentions {
  const source = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const mentions: Mentions = { games: new Set(), people: new Set(), publishers: new Set() };

  for (const [, component, id] of source.matchAll(
    /<(GameLink|GameCard|PersonLink|PublisherLink)\b[^>]*?\bid=["']([^"']+)["']/g,
  )) {
    mentions[BY_COMPONENT[component]].add(id);
  }
  for (const [, list] of source.matchAll(/<GameList\b[^>]*?\bids=\{\[([^\]]*)\]\}/g)) {
    for (const [, id] of list.matchAll(/["']([^"']+)["']/g)) mentions.games.add(id);
  }
  return mentions;
}

export type Citation = {
  post: Post;
  /** Jeux liés à la fiche (ses jeux, ses extensions) cités dans le billet. */
  via: CollectionEntry<"games">[];
};

/**
 * Billets publiés (du plus récent au plus ancien) qui citent la fiche `id`,
 * directement ou à travers l'un des `related` (jeux d'un auteur, extensions d'un jeu…).
 */
export async function postsCiting(
  collection: FicheCollection,
  id: string,
  related: CollectionEntry<"games">[] = [],
): Promise<Citation[]> {
  const posts = await getPublishedPosts();
  return posts.flatMap((post) => {
    const mentions = findMentions(post.body ?? "");
    const via = related.filter((g) => mentions.games.has(g.id));
    return mentions[collection].has(id) || via.length > 0 ? [{ post, via }] : [];
  });
}
