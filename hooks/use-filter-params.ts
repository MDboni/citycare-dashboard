"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Keeps a list page filters in the URL rather than in component state.
 *
 * It costs a Suspense boundary around the page, but it buys three things state
 * cannot: the back button steps through filter changes, a filtered view can be
 * pasted to a colleague, and a refresh does not drop the view. `router.replace`
 * rather than `push` for everything except the page number, so scrubbing a
 * search box does not fill the history stack.
 */
export type FilterValues = Record<string, string | undefined>;

export const useFilterParams = <T extends FilterValues>(defaults: T) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value !== null && value !== "")
        out[key as keyof T] = value as T[keyof T];
    }
    return out;
  }, [searchParams, defaults]);

  const write = useCallback(
    (patch: Partial<Record<keyof T, string | undefined>>, push = false) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "" || value === defaults[key]) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      // Any filter change invalidates the current page number.
      if (!("page" in patch)) next.delete("page");

      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (push) router.push(url);
      else router.replace(url, { scroll: false });
    },
    [searchParams, pathname, router, defaults],
  );

  const setFilter = useCallback(
    (key: keyof T, value: string | undefined) =>
      write({ [key]: value } as Partial<Record<keyof T, string | undefined>>),
    [write],
  );

  const setPage = useCallback(
    (page: number) =>
      write(
        { page: page > 1 ? String(page) : undefined } as Partial<
          Record<keyof T, string | undefined>
        >,
        true,
      ),
    [write],
  );

  const reset = useCallback(() => router.replace(pathname), [router, pathname]);

  /** True when anything other than the page number has been narrowed. */
  const isFiltered = useMemo(
    () =>
      Object.keys(defaults).some(
        (key) => key !== "page" && values[key as keyof T] !== defaults[key],
      ),
    [values, defaults],
  );

  return { values, setFilter, setPage, write, reset, isFiltered };
};
