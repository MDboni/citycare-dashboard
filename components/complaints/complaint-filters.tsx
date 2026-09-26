"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useWards } from "@/hooks";
import { COMPLAINT_STATUS_META, PRIORITY_META } from "@/lib/constants";
import { COMPLAINT_STATUSES, PRIORITIES } from "@/types";

export type ComplaintFilterValues = {
  q: string;
  status: string;
  priority: string;
  categoryId: string;
  wardId: string;
  page: string;
};

export const COMPLAINT_FILTER_DEFAULTS: ComplaintFilterValues = {
  q: "",
  status: "all",
  priority: "all",
  categoryId: "all",
  wardId: "all",
  page: "1",
};

/**
 * `"all"` rather than `""` for the select sentinels: Base UI treats an empty
 * string as a real value and would show it as the selected label, so the
 * placeholder would never come back once something had been picked.
 */
export function ComplaintFilters({
  values,
  onChange,
  onReset,
  isFiltered,
  showPriority = false,
}: {
  values: ComplaintFilterValues;
  onChange: (key: keyof ComplaintFilterValues, value: string) => void;
  onReset: () => void;
  isFiltered: boolean;
  showPriority?: boolean;
}) {
  const categories = useCategories();
  const wards = useWards();

  // The text box is local and debounced; the rest write straight through.
  const [search, setSearch] = useState(values.q);

  useEffect(() => setSearch(values.q), [values.q]);

  useEffect(() => {
    if (search === values.q) return;
    const timer = setTimeout(() => onChange("q", search), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, onChange]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-xs">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, description or id"
          aria-label="Search complaints"
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={values.status}
          onValueChange={(value) => onChange("status", String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {COMPLAINT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {COMPLAINT_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showPriority && (
          <Select
            value={values.priority}
            onValueChange={(value) =>
              onChange("priority", String(value ?? "all"))
            }
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any priority</SelectItem>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRIORITY_META[priority].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={values.categoryId}
          onValueChange={(value) =>
            onChange("categoryId", String(value ?? "all"))
          }
        >
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any category</SelectItem>
            {(categories.data ?? []).map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.wardId}
          onValueChange={(value) => onChange("wardId", String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue placeholder="Ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any ward</SelectItem>
            {(wards.data ?? []).map((ward) => (
              <SelectItem key={ward.id} value={ward.id}>
                Ward {ward.number} — {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <XIcon />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

/** Turns the UI sentinels back into what the API expects to receive. */
export const toComplaintQuery = (values: ComplaintFilterValues) => ({
  page: Number(values.page) || 1,
  limit: 10,
  ...(values.q ? { q: values.q } : {}),
  ...(values.status !== "all" ? { status: values.status } : {}),
  ...(values.priority !== "all"
    ? { priority: values.priority as (typeof PRIORITIES)[number] }
    : {}),
  ...(values.categoryId !== "all" ? { categoryId: values.categoryId } : {}),
  ...(values.wardId !== "all" ? { wardId: values.wardId } : {}),
});
