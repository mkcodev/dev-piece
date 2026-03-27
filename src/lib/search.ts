import Fuse from 'fuse.js';

export interface SearchItem {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  slug: string;
  href: string;
  featured: boolean;
}

export interface SearchIndex {
  items: SearchItem[];
}

// Fuse.js options
export const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'category', weight: 1 },
    { name: 'categoryLabel', weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function createSearchIndex(items: SearchItem[]) {
  return new Fuse(items, fuseOptions);
}
