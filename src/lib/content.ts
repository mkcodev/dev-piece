import { getCollection } from 'astro:content';
import { CATEGORY_CONFIG } from './utils';
import type { SearchItem } from './search';

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>;

export async function getAllTools() {
  const allEntries = await Promise.all(
    ALL_CATEGORIES.map(async (cat) => {
      try {
        const entries = await getCollection(cat as any);
        return entries.map((e: any) => ({ ...e, collectionName: cat }));
      } catch {
        return [];
      }
    })
  );
  return allEntries.flat();
}

export async function getFeaturedTools() {
  const all = await getAllTools();
  return all.filter((t) => t.data.featured);
}

export async function getRecentTools(limit = 6) {
  const all = await getAllTools();
  return all
    .sort((a, b) => new Date(b.data.addedAt).getTime() - new Date(a.data.addedAt).getTime())
    .slice(0, limit);
}

export async function buildSearchIndex(): Promise<SearchItem[]> {
  const all = await getAllTools();
  return all.map((entry) => {
    const cat = entry.collectionName as string;
    const catConfig = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
    return {
      id: `${cat}/${entry.id}`,
      name: entry.data.name,
      description: entry.data.description,
      category: cat,
      categoryLabel: catConfig?.label ?? cat,
      tags: entry.data.tags,
      slug: entry.id,
      href: `/${cat}/${entry.id}`,
      featured: entry.data.featured,
    };
  });
}
