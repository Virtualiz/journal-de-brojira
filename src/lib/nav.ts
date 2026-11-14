import type { IconName } from "../components/Icon.astro";

/** Source unique de la navigation (en-tête desktop, drawer mobile, puis pied de page). */
export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

export interface NavGroup {
  label: string;
  icon: IconName;
  children: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export const isGroup = (item: NavItem): item is NavGroup => "children" in item;

export const nav: NavItem[] = [
  { href: "/", label: "Accueil", icon: "house" },
  { href: "/blog/", label: "Journal", icon: "book-open" },
  { href: "/jeux/", label: "Jeux", icon: "dices" },
  { href: "/atelier/", label: "Atelier", icon: "hammer" },
  { href: "/grimoire/", label: "Grimoire", icon: "scroll" },
  {
    label: "Archives",
    icon: "archive",
    children: [
      { href: "/auteurs/", label: "Auteurs", icon: "users" },
      { href: "/editeurs/", label: "Éditeurs", icon: "building" },
      { href: "/tags/", label: "Tags", icon: "tag" },
    ],
  },
  { href: "/about/", label: "À propos", icon: "user" },
];

export const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const isItemActive = (item: NavItem, pathname: string): boolean =>
  isGroup(item)
    ? item.children.some((c) => isActive(c.href, pathname))
    : isActive(item.href, pathname);
