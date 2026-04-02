interface Category {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  onChange: (value: number | null) => void;
}

export default function CategoryFilter({ categories, onChange }: Props) {
  return (
    <div className="mb-8">

      <select
        className="
          border border-border
          rounded-md
          px-3 py-2
          bg-background
        "
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >

        <option value="">
          All Categories
        </option>

        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}

      </select>

    </div>
  );
}