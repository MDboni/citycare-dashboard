"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatNumber, truncate } from "@/lib/format";

export type CountDatum = { label: string; count: number };

/**
 * The one chart shape this console needs.
 *
 * Every question a municipal dashboard asks of these numbers is the same one —
 * compare a count across labelled buckets — and the form for that job is a
 * horizontal bar with a single hue. Going horizontal is what lets a label like
 * "Waste collection missed" or "Ward 14 — Dhanmondi" sit as readable text on the
 * axis instead of being turned on its side.
 *
 * One series means no legend: the card title already says what is plotted, so a
 * box with one swatch would only restate it. The value rides the tip of each bar,
 * which is the secondary encoding that lets the chart stay one colour.
 */
export function CountBarChart({
  data,
  label,
  /** A per-bar colour, for an ordered scale. Omitted, every bar is chart-1. */
  colors,
  /** For a bar that carries money rather than a count of things. */
  formatValue = formatNumber,
  height = 260,
}: {
  data: CountDatum[];
  label: string;
  colors?: string[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const config = {
    count: { label, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  // Sorting by size is what makes a magnitude chart readable; an ordered scale
  // (priority, say) passes its own colours and keeps its natural order.
  const rows = colors ? data : [...data].sort((a, b) => b.count - a.count);

  const longest = rows.reduce((max, row) => Math.max(max, row.label.length), 0);
  const axisWidth = Math.min(168, Math.max(76, longest * 6.6));

  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: 4, right: 40, top: 4, bottom: 4 }}
      >
        {/* Hairline, solid, one step off the surface, and only on the value axis
            — a category axis has no scale to tick against. */}
        <CartesianGrid
          horizontal={false}
          stroke="var(--border)"
          strokeWidth={1}
        />

        <XAxis
          type="number"
          dataKey="count"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(value: number) => formatValue(value)}
          allowDecimals={false}
        />

        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={axisWidth}
          tickMargin={6}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(value: string) => truncate(value, 24)}
        />

        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={<ChartTooltipContent indicator="dot" />}
        />

        <Bar
          dataKey="count"
          // 4px rounded at the data end, square at the baseline.
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          fill="var(--color-count)"
          // A 2px gap in the surface colour is what separates touching bars.
          stroke="var(--card)"
          strokeWidth={2}
          // The value at the tip of the bar. It is the only direct label on the
          // chart, which is what lets the axis stay uncluttered and the fill stay
          // one colour. Text wears an ink token, never the series colour.
          label={{
            position: "right",
            offset: 8,
            fill: "var(--foreground)",
            fontSize: 11,
            formatter: (value: unknown) => formatValue(Number(value)),
          }}
        >
          {/* An ordered scale paints each bar its own step of one hue; without
              `colors` the Bar fill above applies to all of them. */}
          {colors?.map((color, index) => (
            <Cell key={rows[index]?.label ?? `step-${index}`} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
