import type { CEFRLevel } from "../../types";

export interface CardFilters {
  category: string;
  level: CEFRLevel | "";
}

interface FiltersBarProps {
  categories: string[];
  filters: CardFilters;
  onChange: (filters: CardFilters) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
}

export function FiltersBar({
  categories,
  filters,
  onChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="rounded-lg border border-gray-300 px-3 py-1.5"
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={filters.level}
        onChange={(e) =>
          onChange({ ...filters, level: e.target.value as CEFRLevel | "" })
        }
        className="rounded-lg border border-gray-300 px-3 py-1.5"
        aria-label="Filtrar por nivel"
      >
        <option value="">Todos los niveles</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
      </select>

      <label className="flex items-center gap-1.5 text-gray-700">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
        />
        Solo favoritos ⭐
      </label>
    </div>
  );
}
