"use client";

import { useSyncExternalStore } from "react";
import { getCasesServerSnapshot, listCases, subscribeCases } from "@/lib/storage";

/** Lista de casos guardados localmente, reativa a saveCase/deleteCase. */
export function useCases() {
  return useSyncExternalStore(subscribeCases, listCases, getCasesServerSnapshot);
}
