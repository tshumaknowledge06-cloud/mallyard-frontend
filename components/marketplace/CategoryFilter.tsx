"use client";

interface Category {
  id: number;
  name: string;
  description?: string; // ✅ NEW (optional support)
}

interface Props {
  categories: Category[];
  onChange: (value: number | null) => void;
}

export default function CategoryFilter({ categories, onChange }: Props) {
  return (
    <div className="mb-8">

      {/* Title */}
      <h2 className="text-lg font-semibold mb-3">
        Explore Categories
      </h2>

      {/* Scroll Container (mobile friendly) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

        {/* All Categories */}
        <button
          onClick={() => onChange(null)}
          className="
            min-w-[160px]
            p-4
            rounded-2xl
            border
            bg-background
            hover:bg-muted
            transition
            text-left
            shadow-sm
            hover:shadow-md
          "
        >
          <p className="font-medium">All</p>
          <p className="text-sm text-muted-foreground">
            Browse everything available
          </p>
        </button>

        {/* Categories */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="
              min-w-[160px]
              p-4
              rounded-2xl
              border
              bg-background
              hover:bg-muted
              transition
              text-left
              shadow-sm
              hover:shadow-md
            "
          >
            <p className="font-medium">
              {cat.name}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              {cat.description || "Explore listings in this category"}
            </p>
          </button>
        ))}

      </div>
    </div>
  );
}