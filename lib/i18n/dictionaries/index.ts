import type { Locale } from "../locales";
import type { Dictionary } from "./types";
import ja from "./ja";
import en from "./en";
import zh from "./zh";
import ko from "./ko";
import de from "./de";
import nl from "./nl";
import fr from "./fr";
import es from "./es";

export const dictionaries: Record<Locale, Dictionary> = {
  ja,
  en,
  zh,
  ko,
  de,
  nl,
  fr,
  es,
};

export type { Dictionary };
