import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Catppuccin Frappé
        base: '#303446',
        mantle: '#292c3c',
        crust: '#232634',
        surface0: '#414559',
        surface1: '#51576d',
        surface2: '#626880',
        text: '#c6d0f5',
        subtext1: '#b5bfe2',
        subtext0: '#a5adce',
        overlay2: '#949cbb',
        overlay1: '#838ba7',
        overlay0: '#737994',
        blue: '#8caaee',
        lavender: '#babbf1',
        sapphire: '#85c1dc',
        sky: '#99d1db',
        teal: '#81c8be',
        green: '#a6d189',
        yellow: '#e5c890',
        peach: '#ef9f76',
        maroon: '#ea999c',
        red: '#e78284',
        mauve: '#ca9ee6',
        pink: '#f4b8e4',
        flamingo: '#eebebe',
        rosewater: '#f2d5cf',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'typewriter': 'typewriter 3s steps(40) infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      maxWidth: {
        content: '1280px',
      },
      width: {
        sidebar: '240px',
      },
    },
  },
  plugins: [animate, typography],
};
