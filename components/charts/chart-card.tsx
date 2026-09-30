"use client";

import { TableIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import type { CountDatum } from "./count-bar-chart";

/**
 * The frame every chart on this page sits in.
 *
 * The table toggle is not a nicety: it is the channel that makes the numbers
 * available to a screen reader, to anyone who cannot separate the bars, and to
 * whoever wants to copy a figure into an email. Any value the chart does not
 * directly label is still reachable here.
 */
export function ChartCard({
  title,
  description,
  data,
  valueLabel = "Count",
  /** Matches whatever the chart inside is formatting its values with. */
  formatValue = formatNumber,
  children,
}: {
  title: string;
  description?: string;
  data: CountDatum[];
  valueLabel?: string;
  formatValue?: (value: number) => string;
  children: ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="gap-0">
      <CardHeader className="gap-1 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="h-card">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={asTable}
            aria-label={
              asTable ? "Show the chart" : "Show the numbers as a table"
            }
            onClick={() => setAsTable((value) => !value)}
          >
            <TableIcon />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing to plot yet.
          </p>
        ) : asTable ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{title}</TableHead>
                <TableHead className="text-right">{valueLabel}</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatValue(row.count)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {total ? `${((row.count / total) * 100).toFixed(1)}%` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
