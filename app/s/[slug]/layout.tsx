import type { ReactNode } from "react";

import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
