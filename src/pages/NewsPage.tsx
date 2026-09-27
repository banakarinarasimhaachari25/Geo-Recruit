import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NewsItem } from '../types';

interface NewsPageProps {
  onNavigate: (path: string, params?: any) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const categories = [
    'All',
    'Jobs',
    'Internships',
    'Education',
    'Scholarships',
    'Hackathons',
    'Examinations',
    'Career',
  ];

  useEffect(() => {
    api.getNews().then((data) => setNews(data));
  }, []);

  const filteredNews =
    selectedCategory === 'All'
      ? news
      : news.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Read More Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-[10px] px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold uppercase">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base">
              {activeArticle.title}
            </h3>

            <div className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className="font-semibold text-primary">{activeArticle.companyOrOrg}</span>
              <span>•</span>
              <span>{activeArticle.date}</span>
            </div>

            <p className="font-body-md text-body-md text-on-surface text-xs leading-relaxed pt-2">
              {activeArticle.description}
            </p>

            <div className="pt-4 flex justify-end gap-2">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          <span>Placement & Hiring Radar</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-1">
          Campus Drives & Industry News
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">
          Curated opportunities, official campus test syllabi, hackathons, and scholarship announcements.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* News Articles List */}
      <div className="space-y-3">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs hover:bg-surface-container-low transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-bold uppercase">
                {item.category}
              </span>
              <span className="font-label-sm text-on-surface-variant text-xs">{item.date}</span>
            </div>

            <h3 className="font-title-md text-title-md text-on-surface font-bold text-sm">
              {item.title}
            </h3>

            <p className="font-body-sm text-body-sm text-on-surface-variant text-xs leading-relaxed line-clamp-2">
              {item.description}
            </p>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Organized by: <strong className="text-on-surface">{item.companyOrOrg}</strong>
              </span>

              <button
                onClick={() => setActiveArticle(item)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Read More</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
