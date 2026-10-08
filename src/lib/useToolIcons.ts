import { useEffect, useState } from 'react';

type IconMap = Record<string, string>;
let cache: IconMap | null = null;
let pending: Promise<IconMap> | null = null;

function load(): Promise<IconMap> {
  pending ??= fetch('/tool-icons.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((map: IconMap) => (cache = map));
  return pending;
}

/** Build-time tool icons (self-hosted, fetched once per session). */
export function useToolIcons(): IconMap | null {
  const [icons, setIcons] = useState<IconMap | null>(cache);
  useEffect(() => {
    if (!cache) load().then(setIcons);
  }, []);
  return icons;
}
