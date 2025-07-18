'use client';

import { useState, useRef, useEffect } from 'react';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  allTags?: string[];
  placeholder?: string;
}

export default function TagSelector({ 
  selectedTags, 
  onChange, 
  allTags = [], 
  placeholder = "タグを選択..." 
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      onChange([...selectedTags, tag.trim()]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredTags = allTags.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <div 
        className="w-full p-2 border border-gray-300 rounded cursor-text min-h-[40px] flex flex-wrap gap-1 items-center"
        onClick={() => setIsOpen(true)}
      >
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-1 hover:text-blue-600"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="flex-1 outline-none bg-transparent min-w-[100px]"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredTags.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2">既存のタグから選択:</div>
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded"
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
          
          {inputValue.trim() && !allTags.includes(inputValue.trim()) && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => addTag(inputValue)}
                className="block w-full text-left px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
              >
                + 新しいタグ「{inputValue.trim()}」を作成
              </button>
            </div>
          )}
          
          {filteredTags.length === 0 && !inputValue.trim() && (
            <div className="p-3 text-sm text-gray-500 text-center">
              タグを入力して作成するか、既存のタグを選択してください
            </div>
          )}
        </div>
      )}
    </div>
  );
}