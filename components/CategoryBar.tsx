
import React from 'react';
import { CATEGORIES } from '../constants';
import { FilterType } from '../types';

interface CategoryBarProps {
  activeCategory: FilterType;
  onCategorySelect: (slug: FilterType) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onCategorySelect }) => {
  return (
    <div className="bg-white border-b sticky top-[138px] md:top-[74px] z-40 overflow-x-auto no-scrollbar shadow-sm">
      <div className="container mx-auto px-4 flex items-center py-3 gap-3 whitespace-nowrap">
        <button
          onClick={() => onCategorySelect('all')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeCategory === 'all'
              ? 'bg-[#0047BA] text-white shadow-lg shadow-blue-200 scale-105'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <i className="fa-solid fa-border-all"></i>
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat.slug)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeCategory === cat.slug
                ? 'bg-[#0047BA] text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <i className={`fa-solid ${cat.icon}`}></i>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
