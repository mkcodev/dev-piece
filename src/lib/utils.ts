import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const CATEGORY_CONFIG: Record<string, {
  label: string;
  description: string;
  accent: string;
  icon: string;
}> = {
  terminales: {
    label: 'Terminales & Shells',
    description: 'Emuladores de terminal, shells modernos y configuraciones de prompt',
    accent: '#8caaee',
    icon: 'terminal',
  },
  'cli-tools': {
    label: 'CLI Tools',
    description: 'Herramientas de línea de comandos que reemplazan y superan a las clásicas',
    accent: '#a6d189',
    icon: 'zap',
  },
  snippets: {
    label: 'Snippets & Aliases',
    description: 'Aliases de shell, configuraciones Git y scripts de productividad',
    accent: '#ef9f76',
    icon: 'code-2',
  },
  neovim: {
    label: 'Neovim',
    description: 'Plugins, configuraciones y setups para el editor modal definitivo',
    accent: '#a6d189',
    icon: 'file-code',
  },
  vscode: {
    label: 'VS Code',
    description: 'Extensiones, settings y keybindings para Visual Studio Code',
    accent: '#8caaee',
    icon: 'code',
  },
  'browser-extensions': {
    label: 'Extensiones de Navegador',
    description: 'Extensiones que transforman tu experiencia de navegación como desarrollador',
    accent: '#e5c890',
    icon: 'globe',
  },
  'scripts-ahk': {
    label: 'AutoHotkey Scripts',
    description: 'Scripts de automatización y remapeo de teclado para Windows',
    accent: '#ca9ee6',
    icon: 'keyboard',
  },
  userscripts: {
    label: 'UserScripts',
    description: 'Scripts de Tampermonkey y Greasemonkey para modificar sitios web',
    accent: '#81c8be',
    icon: 'scroll',
  },
  dotfiles: {
    label: 'Dotfiles & Configs',
    description: 'Configuraciones de entorno y archivos dotfiles esenciales',
    accent: '#babbf1',
    icon: 'settings',
  },
  docker: {
    label: 'Docker Hacks',
    description: 'Comandos, aliases y trucos para dominar Docker y Compose',
    accent: '#85c1dc',
    icon: 'box',
  },
  'git-hacks': {
    label: 'Git Power Moves',
    description: 'Técnicas avanzadas de Git para flujos de trabajo profesionales',
    accent: '#ef9f76',
    icon: 'git-branch',
  },
  fonts: {
    label: 'Fuentes para Devs',
    description: 'Las mejores fuentes monoespaciadas con ligaduras para código',
    accent: '#f4b8e4',
    icon: 'type',
  },
  'ai-tools': {
    label: 'IA para Devs',
    description: 'Herramientas de inteligencia artificial para potenciar tu workflow',
    accent: '#babbf1',
    icon: 'bot',
  },
  'windows-tools': {
    label: 'Windows Power Tools',
    description: 'Utilidades y herramientas para convertir Windows en un sistema pro',
    accent: '#99d1db',
    icon: 'monitor',
  },
  learning: {
    label: 'Aprendiendo',
    description: 'Cursos, libros, canales de YouTube y documentación esencial para desarrolladores',
    accent: '#a6d189',
    icon: 'book-open',
  },
  'web-resources': {
    label: 'Web Dev Resources',
    description: 'Sitios, herramientas online y referencias imprescindibles para desarrollo web',
    accent: '#81c8be',
    icon: 'globe-2',
  },
};
