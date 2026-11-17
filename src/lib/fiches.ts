/**
 * Fiches du site (jeux, personnes, éditeurs) : URLs et recherche par id pour les composants de billet.
 * Une fiche absente n'interrompt pas le build : le composant affiche du texte simple
 * et un avertissement est écrit dans la console (une seule fois par id).
 */
import { getEntry, type CollectionEntry } from "astro:content";

export const gameHref = (id: string) => `/jeux/${id}/`;
export const personHref = (id: string) => `/auteurs/${id}/`;
export const publisherHref = (id: string) => `/editeurs/${id}/`;

type FicheCollection = "games" | "people" | "publishers";

const sources: Record<FicheCollection, (id: string) => string> = {
  games: (id) => `src/data/games/${id}.md`,
  people: () => "src/data/people.json",
  publishers: () => "src/data/publishers.json",
};

const warned = new Set<string>();

/** Fiche `id` de la collection, ou undefined (avec un avertissement) si elle n'existe pas encore. */
export async function findFiche<C extends FicheCollection>(
  collection: C,
  id: string,
  component: string,
): Promise<CollectionEntry<C> | undefined> {
  const entry = (await getEntry(collection, id)) as CollectionEntry<C> | undefined;
  const key = `${collection}:${id}`;
  if (!entry && !warned.has(key)) {
    warned.add(key);
    console.warn(
      `[${component}] Fiche introuvable : "${id}" (à créer dans ${sources[collection](id)}). Affichée en texte simple.`,
    );
  }
  return entry;
}
