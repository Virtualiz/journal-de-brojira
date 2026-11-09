// Regroupement alphabétique pour les pages d'index (jeux, auteurs, éditeurs).

/** Initiale sans accent ("Éric" → "E"), "#" si ce n'est pas une lettre. */
export const letterOf = (name: string) => {
  const first = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

/** Identifiant d'ancre d'une lettre. */
export const anchor = (letter: string) =>
  `lettre-${letter === "#" ? "autres" : letter}`;

/** Trie par nom et regroupe par initiale ("#" en dernier). */
export function groupByLetter<T>(items: T[], getName: (item: T) => string) {
  const sorted = [...items].sort((a, b) =>
    getName(a).localeCompare(getName(b), "fr"),
  );
  const groups = new Map<string, T[]>();
  for (const item of sorted) {
    const letter = letterOf(getName(item));
    groups.set(letter, [...(groups.get(letter) ?? []), item]);
  }
  const letters = [...groups.keys()].sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b),
  );
  return { letters, groups };
}
