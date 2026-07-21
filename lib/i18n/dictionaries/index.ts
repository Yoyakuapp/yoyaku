import type { Locale } from "../locales";
import type { Dictionary } from "./types";
import ja from "./ja";
import en from "./en";

export const dictionaries: Record<Locale, Dictionary> = {
  ja,
  en,
};

export type { Dictionary };
