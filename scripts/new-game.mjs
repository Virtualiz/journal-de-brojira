#!/usr/bin/env node
/**
 * Crée les fiches de jeux à partir des blocs copiés depuis campustech (voir Billets.md).
 *
 *   pnpm new-game blocs.txt          # depuis un fichier
 *   pbpaste | pnpm new-game          # depuis le presse-papier (macOS)
 *   pnpm new-game blocs.txt --dry-run   # affiche sans rien écrire
 *   pnpm new-game blocs.txt --force     # remplace les fiches existantes
 *
 * Un bloc par jeu, séparés par une ligne vide :
 *
 *   https://www.campustech.fr/wp-content/uploads/2026/07/foret-mixte-smoky-mountains.png
 *   Forêt Mixte Smoky Mountains
 *   👨‍👩‍👦 2-5 joueurs
 *   🎂 10+
 *   ⏱ 60 min
 *   ⚙️ Tableau-building, Draft
 *   💡 Kosch
 *   🎨 Toni Llobet, Judit Piella
 *   🛠️ Lookout Games
 *   🚚 Asmodee
 *   📆 Sortie : 23/10/2026        (ignoré)
 *   26€                           (prix, facultatif)
 *   kind: extension               (facultatif : jeu | extension | suite)
 *   parent: foret-mixte           (facultatif : id du jeu de base)
 *   id: foret-mixte-smoky         (facultatif : sinon calculé depuis le nom)
 *
 * - "Extension" dans les mécaniques → kind: extension.
 * - Parent deviné pour « Jeu : Extension » si la fiche « jeu » existe.
 * - Auteurs, illustrateurs et éditeurs absents de people.json / publishers.json y sont ajoutés
 *   (comparaison sans accents ni majuscules, sur l'id ou le nom).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAMES_DIR = path.join(root, "src/data/games");
const PEOPLE_FILE = path.join(root, "src/data/people.json");
const PUBLISHERS_FILE = path.join(root, "src/data/publishers.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const inputFile = args.find((a) => !a.startsWith("--"));

// Emojis campustech → champ de la fiche (comparés sans le sélecteur de variante U+FE0F).
const FIELDS = [
  ["👨‍👩‍👦", "players"],
  ["🎂", "age"],
  ["⏱", "duration"],
  ["⚙", "mechanics"],
  ["💡", "authors"],
  ["🎨", "artists"],
  ["🛠", "publisher"],
  ["🚚", "distributor"],
  ["📆", null],
];
const OPTIONS = ["id", "kind", "parent", "price", "description"];
const KINDS = ["jeu", "extension", "suite"];

const stripVS = (s) => s.replace(/️/g, "");

export function slugify(text) {
  return text
    .replace(/[œŒ]/g, "oe")
    .replace(/[æÆ]/g, "ae")
    .replace(/[øØ]/g, "o")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const splitList = (value) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function parseBlock(text) {
  const game = { mechanics: [], authors: [], artists: [] };
  const rest = [];
  let hasField = false;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const clean = stripVS(line);

    const field = FIELDS.find(([emoji]) => clean.startsWith(emoji));
    if (field) {
      hasField = true;
      const [emoji, key] = field;
      if (!key) continue;
      const value = clean.slice(emoji.length).trim();
      game[key] = ["mechanics", "authors", "artists"].includes(key) ? splitList(value) : value;
      continue;
    }

    const image = line.match(/https?:\/\/\S+\.(?:png|jpe?g|webp|avif|gif)(?:\?\S*)?/i);
    if (image) {
      game.image = image[0];
      continue;
    }

    const price = line.match(/^(?:prix\s*:?\s*)?(~?\d+(?:[.,]\d+)?)\s*€$/i);
    if (price) {
      game.price = `${price[1]}€`;
      continue;
    }

    const option = line.match(/^(\w+)\s*:\s*(.+)$/);
    if (option && OPTIONS.includes(option[1].toLowerCase())) {
      game[option[1].toLowerCase()] = option[2].trim();
      continue;
    }

    rest.push(line);
  }

  if (!hasField && !game.image) return undefined;
  game.name = rest[0];
  return game;
}

// people.json / publishers.json : un objet par ligne, comme les fichiers écrits à la main.
const readList = (file) => JSON.parse(readFileSync(file, "utf8"));
const formatList = (list) =>
  `[\n${list
    .map((o) => `  { ${Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")} }`)
    .join(",\n")}\n]\n`;

function resolver(list, added) {
  const key = (s) => slugify(s);
  return (name) => {
    const slug = key(name);
    const found = list.find((e) => e.id === slug || key(e.name) === slug);
    if (found) return found.id;
    let id = slug;
    for (let i = 2; list.some((e) => e.id === id); i++) id = `${slug}-${i}`;
    list.push({ id, name });
    added.push(`${id} (${name})`);
    return id;
  };
}

function toMarkdown(g) {
  const s = JSON.stringify;
  const lines = [`name: ${s(g.name)}`];
  if (g.image) lines.push(`image: ${s(g.image)}`);
  if (g.description) lines.push(`description: ${s(g.description)}`);
  if (g.kind !== "jeu") lines.push(`kind: ${s(g.kind)}`);
  if (g.parent) lines.push(`parent: ${s(g.parent)}`);
  for (const k of ["players", "age", "duration"]) if (g[k]) lines.push(`${k}: ${s(g[k])}`);
  for (const k of ["mechanics", "authors", "artists"]) if (g[k].length) lines.push(`${k}: ${s(g[k])}`);
  for (const k of ["publisher", "distributor", "price"]) if (g[k]) lines.push(`${k}: ${s(g[k])}`);
  return `---\n${lines.join("\n").replaceAll('","', '", "')}\n---\n`;
}

function main() {
  const input = inputFile ? readFileSync(inputFile, "utf8") : readFileSync(0, "utf8");
  const blocks = input
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map(parseBlock)
    .filter(Boolean);

  if (blocks.length === 0) {
    console.error("Aucun bloc de jeu trouvé (voir l'en-tête de scripts/new-game.mjs).");
    process.exit(1);
  }

  const people = readList(PEOPLE_FILE);
  const publishers = readList(PUBLISHERS_FILE);
  const addedPeople = [];
  const addedPublishers = [];
  const person = resolver(people, addedPeople);
  const publisher = resolver(publishers, addedPublishers);

  const created = [];
  const skipped = [];
  const warnings = [];

  for (const g of blocks) {
    if (!g.name) {
      warnings.push(`Bloc sans nom ignoré${g.image ? ` (${g.image})` : ""}.`);
      continue;
    }
    const id = g.id ? slugify(g.id) : slugify(g.name);
    const file = path.join(GAMES_DIR, `${id}.md`);
    if (existsSync(file) && !force) {
      skipped.push(id);
      continue;
    }

    g.kind = g.kind?.toLowerCase() ?? (g.mechanics.some((m) => slugify(m) === "extension") ? "extension" : "jeu");
    if (!KINDS.includes(g.kind)) {
      warnings.push(`${id} : kind "${g.kind}" inconnu, remplacé par "jeu".`);
      g.kind = "jeu";
    }
    if (g.parent) {
      g.parent = slugify(g.parent);
      if (!existsSync(path.join(GAMES_DIR, `${g.parent}.md`)))
        warnings.push(`${id} : parent "${g.parent}" sans fiche, à créer (sinon le build échoue).`);
    } else if (g.kind !== "jeu" && g.name.includes(":")) {
      const guess = slugify(g.name.split(":")[0]);
      if (existsSync(path.join(GAMES_DIR, `${guess}.md`))) g.parent = guess;
    }

    g.authors = g.authors.map(person);
    g.artists = g.artists.map(person);
    if (g.publisher) g.publisher = publisher(g.publisher);
    if (g.distributor) g.distributor = publisher(g.distributor);
    if (!g.image) warnings.push(`${id} : pas d'image.`);
    if (!g.price) warnings.push(`${id} : pas de prix.`);

    created.push(`${id}${g.kind !== "jeu" ? ` [${g.kind}${g.parent ? ` de ${g.parent}` : ""}]` : ""}`);
    if (dryRun) console.log(`--- ${id}.md\n${toMarkdown(g)}`);
    else writeFileSync(file, toMarkdown(g));
  }

  if (!dryRun) {
    if (addedPeople.length) writeFileSync(PEOPLE_FILE, formatList(people));
    if (addedPublishers.length) writeFileSync(PUBLISHERS_FILE, formatList(publishers));
  }

  const report = (title, list) => list.length && console.log(`${title} (${list.length}) :\n  ${list.join("\n  ")}`);
  if (dryRun) console.log("Simulation : aucun fichier écrit.\n");
  report("Fiches créées", created);
  report("Déjà existantes, ignorées (--force pour remplacer)", skipped);
  report("Personnes ajoutées à people.json", addedPeople);
  report("Éditeurs ajoutés à publishers.json", addedPublishers);
  report("À vérifier", warnings);
}

main();
