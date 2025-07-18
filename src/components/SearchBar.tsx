'use client';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onClearFilters,
}: SearchBarProps) {
  return (
    <div className="flex gap-2 mb-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="TODOを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {(searchQuery) && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          クリア
        </button>
      )}
    </div>
  );
}