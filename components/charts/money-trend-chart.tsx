"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  formatBdt,
  formatBdtShort,
  formatDate,
  formatDayMonth,
} from "@/lib/format";

export type MoneyDatum = { date: string; amount: string; count: number };

/**
 * Money settled per day.
 *
 * Vertical bars and never sorted, unlike every other chart in this console: the
 * x axis here is time, and reordering it by size would turn the one chart that
 * answers "when did the money come in" into a chart that cannot answer it.
 *
 * No label on the bars either. A month of them would collide into a grey smear,
 * so the value lives on the axis and in the tooltip, and the card carries a
 * table view for anyone the tooltip does not reach.
 */
export function MoneyTrendChart({
  data,
  height = 240,
}: {
  data: MoneyDatum[];
  height?: number;
}) {
  const config = {
    amount: { label: "Collected", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  /*
    The API only returns days it has money for, so a quiet week arrives as no
    rows at all. Plotted straight, two bars a fortnight apart would sit side by
    side and read as two consecutive days. The gaps are filled with zeroes so
    the axis is a calendar rather than a list of paydays.
  */
  const rows = fillGaps(data);

  return (
    <ChartContainer config={config} style={{ height }} className="w-full">
      <BarChart
        accessibilityLayer
        data={rows}
        margin={{ left: 4, right: 8, top: 8, bottom: 4 }}
      >
        {/* Hairline, and only on the value axis — a date axis has no scale to
            tick against. */}
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeWidth={1}
        />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(value: string) => formatDayMonth(value)}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickMargin={6}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(value: number) => formatBdtShort(value)}
        />

        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => formatDate(String(value))}
              formatter={(value, _name, item) => (
                <span className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.count === 1
                      ? "1 payment"
                      : `${item.payload.count} payments`}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatBdt(Number(value))}
                  </span>
                </span>
              )}
            />
          }
        />

        <Bar
          dataKey="amount"
          // 4px rounded at the data end, square at the baseline.
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          fill="var(--color-amount)"
          // A 2px gap in the surface colour is what separates touching bars.
          stroke="var(--card)"
          strokeWidth={2}
        />
      </BarChart>
    </ChartContainer>
  );
}

/** Every day between the first and the last, with the quiet ones at zero. */
function fillGaps(data: MoneyDatum[]) {
  const numeric = data.map((row) => ({ ...row, amount: Number(row.amount) }));
  if (numeric.length < 2) return numeric;

  const byDate = new Map(numeric.map((row) => [row.date, row]));
  const first = numeric[0];
  const last = numeric.at(-1);
  if (!first || !last) return numeric;

  const out: { date: string; amount: number; count: number }[] = [];
  const day = new Date(`${first.date}T00:00:00Z`);
  const end = new Date(`${last.date}T00:00:00Z`);

  // A guard, not a limit: a range this wide is a chart nobody can read anyway,
  // and an unbounded loop over a bad date is worse than a short one.
  for (let i = 0; day <= end && i < 400; i++) {
    const key = day.toISOString().slice(0, 10);
    out.push(byDate.get(key) ?? { date: key, amount: 0, count: 0 });
    day.setUTCDate(day.getUTCDate() + 1);
  }

  return out;
}
