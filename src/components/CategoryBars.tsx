import type { CategoryImpact } from "@/src/lib/types";

type Props = {
  categories: CategoryImpact[];
  highlight?: string;
};

export function CategoryBars({ categories, highlight }: Props) {
  const sorted = [...categories].sort((a, b) => b.kgCo2e - a.kgCo2e);
  const max = Math.max(...sorted.map((c) => c.kgCo2e), 1);

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-medium text-white">Impact by category</h3>
      <ul className="space-y-3">
        {sorted.map((category) => {
          const width = `${Math.max((category.kgCo2e / max) * 100, 2)}%`;
          const isHot = category.category === highlight;
          return (
            <li key={category.category}>
              <div className="mb-1 flex justify-between text-sm">
                <span className={isHot ? "text-lime-400" : "text-neutral-300"}>
                  {category.category}
                  {isHot ? " · dominant" : ""}
                </span>
                <span className="text-neutral-400">
                  {category.kgCo2e.toFixed(1)} kg
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-800">
                <div
                  className={`h-2 rounded-full ${isHot ? "bg-lime-400" : "bg-neutral-400"}`}
                  style={{ width }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
