'use client';

interface FilterBarProps {
  allTags: string[];
  selectedTags: string[];
  selectedPriorities: string[];
  showCompleted: boolean;
  onToggleTag: (tag: string) => void;
  onTogglePriority: (priority: string) => void;
  onToggleCompleted: (show: boolean) => void;
}

export default function FilterBar({
  allTags,
  selectedTags,
  selectedPriorities,
  showCompleted,
  onToggleTag,
  onTogglePriority,
  onToggleCompleted,
}: FilterBarProps) {
  const priorities = ['high', 'medium', 'low'];
  const priorityLabels = { high: '高', medium: '中', low: '低' };

  return (
    <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* タグフィルター */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">タグ</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 優先度フィルター */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">優先度</h3>
        <div className="flex gap-2">
          {priorities.map(priority => (
            <button
              key={priority}
              onClick={() => onTogglePriority(priority)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedPriorities.includes(priority)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {priorityLabels[priority as keyof typeof priorityLabels]}
            </button>
          ))}
        </div>
      </div>

      {/* 完了状態フィルター */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => onToggleCompleted(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">完了済みを表示</span>
        </label>
      </div>
    </div>
  );
}