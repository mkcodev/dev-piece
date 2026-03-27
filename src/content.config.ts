import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const toolSchema = z.object({
  name: z.string(),
  description: z.string().max(200),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  iconType: z.enum(['lucide', 'simple']).default('lucide'),
  category: z.string(),
  tags: z.array(z.string()),
  os: z.array(z.enum(['windows', 'macos', 'linux', 'cross'])),
  featured: z.boolean().default(false),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  install: z.object({
    winget: z.string().optional(),
    scoop: z.string().optional(),
    choco: z.string().optional(),
    brew: z.string().optional(),
    apt: z.string().optional(),
    cargo: z.string().optional(),
    npm: z.string().optional(),
    pnpm: z.string().optional(),
    pip: z.string().optional(),
    manual: z.string().optional(),
  }).optional(),
  commands: z.array(z.object({
    label: z.string(),
    code: z.string(),
    lang: z.string().default('bash'),
    description: z.string().optional(),
  })).optional(),
  links: z.object({
    repo: z.string().url().optional(),
    docs: z.string().url().optional(),
    website: z.string().url().optional(),
    video: z.string().url().optional(),
  }).optional(),
  config: z.string().optional(),
  configLang: z.string().optional(),
  related: z.array(z.string()).optional(),
  addedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export const collections = {
  terminales: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/terminales' }),
    schema: toolSchema,
  }),
  'cli-tools': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cli-tools' }),
    schema: toolSchema,
  }),
  snippets: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/snippets' }),
    schema: toolSchema,
  }),
  neovim: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/neovim' }),
    schema: toolSchema,
  }),
  vscode: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/vscode' }),
    schema: toolSchema,
  }),
  'browser-extensions': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/browser-extensions' }),
    schema: toolSchema,
  }),
  'scripts-ahk': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/scripts-ahk' }),
    schema: toolSchema,
  }),
  userscripts: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/userscripts' }),
    schema: toolSchema,
  }),
  dotfiles: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dotfiles' }),
    schema: toolSchema,
  }),
  docker: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docker' }),
    schema: toolSchema,
  }),
  'git-hacks': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/git-hacks' }),
    schema: toolSchema,
  }),
  fonts: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/fonts' }),
    schema: toolSchema,
  }),
  'ai-tools': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ai-tools' }),
    schema: toolSchema,
  }),
  'windows-tools': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/windows-tools' }),
    schema: toolSchema,
  }),
};
