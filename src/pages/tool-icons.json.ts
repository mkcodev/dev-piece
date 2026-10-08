import type { APIRoute } from 'astro';
import { getAllTools } from '../lib/content';
import { toolIconSvg } from '../lib/tool-icons';

// Icon markup for every tool, keyed by "category/slug". Only the arsenal views
// fetch it: they render tools read from localStorage, not from content at build.
export const GET: APIRoute = async () => {
  const tools = await getAllTools();
  const icons = Object.fromEntries(
    tools.map((t) => [`${t.collectionName}/${t.id}`, toolIconSvg(t.id, t.collectionName, 'w-full h-full')]),
  );
  return new Response(JSON.stringify(icons), { headers: { 'Content-Type': 'application/json' } });
};
