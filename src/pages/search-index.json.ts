import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../lib/content';

export const GET: APIRoute = async () => {
  const items = await buildSearchIndex();
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
