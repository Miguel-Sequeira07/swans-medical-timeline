"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

type Theme = "light" | "dark";

/**
 * The actual theme is applied before hydration by the inline script in
 * layout.tsx (avoids a flash of the wrong background) — this component
 * only reflects/toggles the `data-theme` attribute it left behind.
 * `useSyncExternalStore` (same pattern as `lib/storage.ts`) reads that
 * external DOM state without a set-state-in-effect render, and its
 * server snapshot ("light") only shows briefly until the client
 * snapshot takes over right after hydration — never a mismatch.
 */
const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  window.localStorage.setItem("theme", next);
  for (const listener of listeners) listener();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-paper-line bg-paper text-foreground shadow-sm transition hover:border-foreground/40 sm:right-6 sm:top-6"
    >
      {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
    </button>
  );
}
