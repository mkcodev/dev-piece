export interface RoadmapNodeData {
  label: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'start' | 'tool' | 'concept' | 'milestone';
  devpieceLink?: string;
  resources?: { label: string; url: string }[];
  phase: number;
}

export interface RoadmapNode {
  id: string;
  position: { x: number; y: number };
  data: RoadmapNodeData;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface RoadmapDef {
  slug: string;
  label: string;
  description: string;
  accent: string;
  icon: string;
  type: 'tech' | 'tools';
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// ─── FrontDev ────────────────────────────────────────────────────────────────
const frontDevNodes: RoadmapNode[] = [
  {
    id: 'html',
    position: { x: 300, y: 0 },
    data: {
      label: 'HTML',
      description: 'La base de toda web. Semántica, accesibilidad, formularios, tablas y estructura de documentos HTML5.',
      difficulty: 'beginner',
      type: 'start',
      phase: 1,
      resources: [
        { label: 'MDN HTML', url: 'https://developer.mozilla.org/es/docs/Web/HTML' },
        { label: 'HTML.com', url: 'https://html.com' },
      ],
    },
  },
  {
    id: 'css',
    position: { x: 300, y: 120 },
    data: {
      label: 'CSS',
      description: 'Estilos, Flexbox, Grid, animaciones, variables CSS y diseño responsive con media queries.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 1,
      resources: [
        { label: 'CSS Tricks', url: 'https://css-tricks.com' },
        { label: 'Flexbox Froggy', url: 'https://flexboxfroggy.com' },
      ],
    },
  },
  {
    id: 'js',
    position: { x: 300, y: 240 },
    data: {
      label: 'JavaScript',
      description: 'ES6+, DOM manipulation, eventos, fetch API, promesas, async/await y módulos.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'javascript.info', url: 'https://javascript.info' },
        { label: 'MDN JS', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript' },
      ],
    },
  },
  {
    id: 'ts',
    position: { x: 300, y: 360 },
    data: {
      label: 'TypeScript',
      description: 'Tipos estáticos, interfaces, generics, decoradores y configuración de tsconfig.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'TypeScript Docs', url: 'https://www.typescriptlang.org/docs/' },
        { label: 'Total TypeScript', url: 'https://www.totaltypescript.com' },
      ],
    },
  },
  {
    id: 'tailwind',
    position: { x: 80, y: 360 },
    data: {
      label: 'Tailwind CSS',
      description: 'Framework utility-first para estilar rápidamente sin escribir CSS personalizado.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 2,
      resources: [
        { label: 'Tailwind Docs', url: 'https://tailwindcss.com/docs' },
      ],
    },
  },
  {
    id: 'react',
    position: { x: 300, y: 480 },
    data: {
      label: 'React',
      description: 'Componentes, hooks (useState, useEffect, useContext), estado global y patrones de composición.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'React Docs', url: 'https://react.dev' },
        { label: 'React Patterns', url: 'https://reactpatterns.com' },
      ],
    },
  },
  {
    id: 'vite',
    position: { x: 80, y: 480 },
    data: {
      label: 'Vite',
      description: 'Bundler ultrarrápido para proyectos frontend modernos con HMR y plugins.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 3,
      resources: [
        { label: 'Vite Docs', url: 'https://vitejs.dev' },
      ],
    },
  },
  {
    id: 'nextjs',
    position: { x: 300, y: 600 },
    data: {
      label: 'Next.js',
      description: 'SSR, SSG, App Router, Server Components, API Routes y optimización de imágenes.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'Next.js Docs', url: 'https://nextjs.org/docs' },
        { label: 'Next.js Learn', url: 'https://nextjs.org/learn' },
      ],
    },
  },
  {
    id: 'state',
    position: { x: 540, y: 540 },
    data: {
      label: 'Estado Global',
      description: 'Zustand, Jotai o Redux Toolkit para gestionar estado complejo entre componentes.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
        { label: 'Jotai', url: 'https://jotai.org' },
      ],
    },
  },
  {
    id: 'testing',
    position: { x: 300, y: 720 },
    data: {
      label: 'Testing',
      description: 'Vitest para unit tests, React Testing Library para componentes y Playwright para E2E.',
      difficulty: 'intermediate',
      type: 'milestone',
      phase: 4,
      resources: [
        { label: 'Vitest', url: 'https://vitest.dev' },
        { label: 'Playwright', url: 'https://playwright.dev' },
      ],
    },
  },
  {
    id: 'performance',
    position: { x: 80, y: 680 },
    data: {
      label: 'Performance',
      description: 'Core Web Vitals, lazy loading, code splitting, memoización y optimización de bundle.',
      difficulty: 'advanced',
      type: 'concept',
      phase: 4,
      resources: [
        { label: 'web.dev Performance', url: 'https://web.dev/performance' },
      ],
    },
  },
  {
    id: 'deploy',
    position: { x: 300, y: 840 },
    data: {
      label: 'Deploy',
      description: 'Vercel, Netlify o Cloudflare Pages. CI/CD, variables de entorno y dominios custom.',
      difficulty: 'beginner',
      type: 'milestone',
      phase: 4,
      resources: [
        { label: 'Vercel', url: 'https://vercel.com' },
        { label: 'Netlify', url: 'https://netlify.com' },
      ],
    },
  },
  {
    id: 'accessibility',
    position: { x: 540, y: 720 },
    data: {
      label: 'Accesibilidad',
      description: 'WCAG 2.1, ARIA roles, navegación por teclado y testing con screen readers.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 4,
      resources: [
        { label: 'a11y Project', url: 'https://www.a11yproject.com' },
      ],
    },
  },
];

const frontDevEdges: RoadmapEdge[] = [
  { id: 'e-html-css', source: 'html', target: 'css', animated: true },
  { id: 'e-css-js', source: 'css', target: 'js', animated: true },
  { id: 'e-css-tailwind', source: 'css', target: 'tailwind' },
  { id: 'e-js-ts', source: 'js', target: 'ts', animated: true },
  { id: 'e-ts-react', source: 'ts', target: 'react', animated: true },
  { id: 'e-tailwind-react', source: 'tailwind', target: 'react' },
  { id: 'e-react-vite', source: 'react', target: 'vite' },
  { id: 'e-react-nextjs', source: 'react', target: 'nextjs', animated: true },
  { id: 'e-react-state', source: 'react', target: 'state' },
  { id: 'e-nextjs-testing', source: 'nextjs', target: 'testing', animated: true },
  { id: 'e-nextjs-performance', source: 'nextjs', target: 'performance' },
  { id: 'e-testing-deploy', source: 'testing', target: 'deploy', animated: true },
  { id: 'e-testing-a11y', source: 'testing', target: 'accessibility' },
];

// ─── BackDev ─────────────────────────────────────────────────────────────────
const backDevNodes: RoadmapNode[] = [
  {
    id: 'nodejs',
    position: { x: 300, y: 0 },
    data: {
      label: 'Node.js',
      description: 'Runtime de JavaScript en servidor. Event loop, streams, módulos y npm ecosystem.',
      difficulty: 'beginner',
      type: 'start',
      phase: 1,
      resources: [
        { label: 'Node.js Docs', url: 'https://nodejs.org/docs/latest' },
        { label: 'NodeBestPractices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
      ],
    },
  },
  {
    id: 'express',
    position: { x: 150, y: 130 },
    data: {
      label: 'Express.js',
      description: 'Framework minimalista para Node. Middleware, routing y configuración básica de API.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 1,
      resources: [
        { label: 'Express Docs', url: 'https://expressjs.com' },
      ],
    },
  },
  {
    id: 'fastify',
    position: { x: 450, y: 130 },
    data: {
      label: 'Fastify / Hono',
      description: 'Frameworks modernos y ultrarrápidos. Mejor rendimiento que Express, con TypeScript nativo.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 1,
      resources: [
        { label: 'Fastify Docs', url: 'https://fastify.dev' },
        { label: 'Hono', url: 'https://hono.dev' },
      ],
    },
  },
  {
    id: 'sql',
    position: { x: 150, y: 270 },
    data: {
      label: 'SQL (PostgreSQL)',
      description: 'Consultas SQL, joins, índices, transacciones y diseño de esquemas relacionales.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com' },
        { label: 'SQLZoo', url: 'https://sqlzoo.net' },
      ],
    },
  },
  {
    id: 'nosql',
    position: { x: 450, y: 270 },
    data: {
      label: 'NoSQL (MongoDB)',
      description: 'Documentos, colecciones, aggregation pipeline y casos de uso de bases de datos no relacionales.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'MongoDB University', url: 'https://university.mongodb.com' },
      ],
    },
  },
  {
    id: 'orm',
    position: { x: 300, y: 390 },
    data: {
      label: 'ORM (Prisma / Drizzle)',
      description: 'Abstracción de base de datos con type-safety. Migraciones, seeds y queries tipadas.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 2,
      resources: [
        { label: 'Prisma Docs', url: 'https://www.prisma.io/docs' },
        { label: 'Drizzle ORM', url: 'https://orm.drizzle.team' },
      ],
    },
  },
  {
    id: 'rest',
    position: { x: 300, y: 510 },
    data: {
      label: 'APIs REST',
      description: 'Diseño RESTful, status codes, versionado, paginación, rate limiting y documentación OpenAPI.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'REST API Design', url: 'https://restfulapi.net' },
        { label: 'Swagger/OpenAPI', url: 'https://swagger.io' },
      ],
    },
  },
  {
    id: 'graphql',
    position: { x: 540, y: 510 },
    data: {
      label: 'GraphQL',
      description: 'Schema, resolvers, mutations, subscriptions y clientes (Apollo, urql).',
      difficulty: 'advanced',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'GraphQL.org', url: 'https://graphql.org/learn' },
      ],
    },
  },
  {
    id: 'auth',
    position: { x: 300, y: 630 },
    data: {
      label: 'Autenticación',
      description: 'JWT, OAuth 2.0, session management, bcrypt y proveedores (Auth.js, Clerk, Supabase Auth).',
      difficulty: 'intermediate',
      type: 'milestone',
      phase: 3,
      resources: [
        { label: 'Auth.js', url: 'https://authjs.dev' },
        { label: 'JWT.io', url: 'https://jwt.io' },
      ],
    },
  },
  {
    id: 'docker',
    position: { x: 150, y: 750 },
    data: {
      label: 'Docker',
      description: 'Contenedores, Dockerfile, docker-compose, networking y gestión de volúmenes.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'Docker Docs', url: 'https://docs.docker.com' },
        { label: 'Play with Docker', url: 'https://labs.play-with-docker.com' },
      ],
    },
  },
  {
    id: 'cicd',
    position: { x: 450, y: 750 },
    data: {
      label: 'CI/CD',
      description: 'GitHub Actions, pipelines de testing, build y deploy automático a producción.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'GitHub Actions', url: 'https://docs.github.com/en/actions' },
      ],
    },
  },
  {
    id: 'monitoring',
    position: { x: 300, y: 870 },
    data: {
      label: 'Monitoreo',
      description: 'Logs estructurados, métricas, alertas y observabilidad con Sentry, Grafana o Datadog.',
      difficulty: 'advanced',
      type: 'milestone',
      phase: 4,
      resources: [
        { label: 'Sentry', url: 'https://sentry.io' },
        { label: 'OpenTelemetry', url: 'https://opentelemetry.io' },
      ],
    },
  },
];

const backDevEdges: RoadmapEdge[] = [
  { id: 'e-node-express', source: 'nodejs', target: 'express', animated: true },
  { id: 'e-node-fastify', source: 'nodejs', target: 'fastify', animated: true },
  { id: 'e-express-sql', source: 'express', target: 'sql' },
  { id: 'e-express-nosql', source: 'express', target: 'nosql' },
  { id: 'e-fastify-nosql', source: 'fastify', target: 'nosql' },
  { id: 'e-sql-orm', source: 'sql', target: 'orm', animated: true },
  { id: 'e-nosql-orm', source: 'nosql', target: 'orm' },
  { id: 'e-orm-rest', source: 'orm', target: 'rest', animated: true },
  { id: 'e-orm-graphql', source: 'orm', target: 'graphql' },
  { id: 'e-rest-auth', source: 'rest', target: 'auth', animated: true },
  { id: 'e-auth-docker', source: 'auth', target: 'docker', animated: true },
  { id: 'e-auth-cicd', source: 'auth', target: 'cicd' },
  { id: 'e-docker-monitoring', source: 'docker', target: 'monitoring', animated: true },
  { id: 'e-cicd-monitoring', source: 'cicd', target: 'monitoring' },
];

// ─── FullDev ──────────────────────────────────────────────────────────────────
const fullDevNodes: RoadmapNode[] = [
  {
    id: 'fd-html-css-js',
    position: { x: 350, y: 0 },
    data: {
      label: 'HTML + CSS + JS',
      description: 'Base completa del desarrollo web. Semántica, estilos y lógica de cliente.',
      difficulty: 'beginner',
      type: 'start',
      phase: 1,
      resources: [
        { label: 'The Odin Project', url: 'https://www.theodinproject.com' },
        { label: 'freeCodeCamp', url: 'https://freecodecamp.org' },
      ],
    },
  },
  {
    id: 'fd-ts',
    position: { x: 350, y: 120 },
    data: {
      label: 'TypeScript',
      description: 'Tipado estático imprescindible para proyectos full stack de calidad.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 1,
      resources: [
        { label: 'TypeScript Docs', url: 'https://www.typescriptlang.org/docs/' },
      ],
    },
  },
  {
    id: 'fd-react',
    position: { x: 150, y: 250 },
    data: {
      label: 'React',
      description: 'Librería UI para construir interfaces dinámicas con componentes reutilizables.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'React Docs', url: 'https://react.dev' },
      ],
    },
  },
  {
    id: 'fd-nodejs',
    position: { x: 550, y: 250 },
    data: {
      label: 'Node.js',
      description: 'Runtime del servidor. El mismo lenguaje en ambos lados reduce la curva de aprendizaje.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'Node.js Docs', url: 'https://nodejs.org/docs/latest' },
      ],
    },
  },
  {
    id: 'fd-nextjs',
    position: { x: 150, y: 380 },
    data: {
      label: 'Next.js',
      description: 'Framework full stack con SSR, API Routes, Server Actions y App Router.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 2,
      resources: [
        { label: 'Next.js Docs', url: 'https://nextjs.org/docs' },
      ],
    },
  },
  {
    id: 'fd-db',
    position: { x: 550, y: 380 },
    data: {
      label: 'Bases de Datos',
      description: 'PostgreSQL para datos relacionales y Redis para caché. Diseño de esquemas eficiente.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'PostgreSQL', url: 'https://www.postgresql.org/docs/' },
        { label: 'Redis', url: 'https://redis.io/docs/' },
      ],
    },
  },
  {
    id: 'fd-prisma',
    position: { x: 350, y: 500 },
    data: {
      label: 'Prisma ORM',
      description: 'ORM type-safe que conecta el backend con la base de datos. Migraciones y seeds.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 3,
      resources: [
        { label: 'Prisma Docs', url: 'https://www.prisma.io/docs' },
      ],
    },
  },
  {
    id: 'fd-auth',
    position: { x: 150, y: 620 },
    data: {
      label: 'Auth & Seguridad',
      description: 'Auth.js, JWT, OAuth2, validación de inputs y protección contra OWASP Top 10.',
      difficulty: 'advanced',
      type: 'milestone',
      phase: 3,
      resources: [
        { label: 'Auth.js', url: 'https://authjs.dev' },
        { label: 'OWASP', url: 'https://owasp.org/www-project-top-ten/' },
      ],
    },
  },
  {
    id: 'fd-api',
    position: { x: 550, y: 620 },
    data: {
      label: 'tRPC / GraphQL',
      description: 'APIs end-to-end type-safe con tRPC o GraphQL para full stack con TypeScript.',
      difficulty: 'advanced',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'tRPC Docs', url: 'https://trpc.io' },
        { label: 'GraphQL.org', url: 'https://graphql.org' },
      ],
    },
  },
  {
    id: 'fd-testing',
    position: { x: 350, y: 730 },
    data: {
      label: 'Testing Full Stack',
      description: 'Unit tests (Vitest), integration tests y E2E con Playwright cubriendo toda la stack.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'Vitest', url: 'https://vitest.dev' },
        { label: 'Playwright', url: 'https://playwright.dev' },
      ],
    },
  },
  {
    id: 'fd-docker',
    position: { x: 150, y: 850 },
    data: {
      label: 'Docker',
      description: 'Contenedores para garantizar que el entorno de dev y prod sean idénticos.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'Docker Docs', url: 'https://docs.docker.com' },
      ],
    },
  },
  {
    id: 'fd-cicd',
    position: { x: 550, y: 850 },
    data: {
      label: 'CI/CD & Deploy',
      description: 'GitHub Actions para correr tests y desplegar automáticamente en Vercel o AWS.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'GitHub Actions', url: 'https://docs.github.com/en/actions' },
        { label: 'Vercel', url: 'https://vercel.com' },
      ],
    },
  },
  {
    id: 'fd-monitoring',
    position: { x: 350, y: 960 },
    data: {
      label: 'Observabilidad',
      description: 'Sentry para errores, Grafana/Prometheus para métricas y logs estructurados.',
      difficulty: 'advanced',
      type: 'milestone',
      phase: 4,
      resources: [
        { label: 'Sentry', url: 'https://sentry.io' },
      ],
    },
  },
];

const fullDevEdges: RoadmapEdge[] = [
  { id: 'e-fd-base-ts', source: 'fd-html-css-js', target: 'fd-ts', animated: true },
  { id: 'e-fd-ts-react', source: 'fd-ts', target: 'fd-react', animated: true },
  { id: 'e-fd-ts-node', source: 'fd-ts', target: 'fd-nodejs', animated: true },
  { id: 'e-fd-react-next', source: 'fd-react', target: 'fd-nextjs', animated: true },
  { id: 'e-fd-node-db', source: 'fd-nodejs', target: 'fd-db', animated: true },
  { id: 'e-fd-next-prisma', source: 'fd-nextjs', target: 'fd-prisma' },
  { id: 'e-fd-db-prisma', source: 'fd-db', target: 'fd-prisma', animated: true },
  { id: 'e-fd-prisma-auth', source: 'fd-prisma', target: 'fd-auth', animated: true },
  { id: 'e-fd-prisma-api', source: 'fd-prisma', target: 'fd-api' },
  { id: 'e-fd-auth-testing', source: 'fd-auth', target: 'fd-testing', animated: true },
  { id: 'e-fd-api-testing', source: 'fd-api', target: 'fd-testing' },
  { id: 'e-fd-testing-docker', source: 'fd-testing', target: 'fd-docker', animated: true },
  { id: 'e-fd-testing-cicd', source: 'fd-testing', target: 'fd-cicd' },
  { id: 'e-fd-docker-monitoring', source: 'fd-docker', target: 'fd-monitoring', animated: true },
  { id: 'e-fd-cicd-monitoring', source: 'fd-cicd', target: 'fd-monitoring' },
];

// ─── JuniorDev (Tools) ────────────────────────────────────────────────────────
const juniorDevNodes: RoadmapNode[] = [
  {
    id: 'jr-terminal',
    position: { x: 300, y: 0 },
    data: {
      label: 'Terminal Básica',
      description: 'Comandos esenciales de bash/zsh: navegación, manipulación de archivos, pipes y redirecciones.',
      difficulty: 'beginner',
      type: 'start',
      phase: 1,
      devpieceLink: '/terminales',
      resources: [
        { label: 'The Missing Semester', url: 'https://missing.csail.mit.edu' },
        { label: 'Linux Command', url: 'https://linuxcommand.org' },
      ],
    },
  },
  {
    id: 'jr-git',
    position: { x: 300, y: 130 },
    data: {
      label: 'Git Básico',
      description: 'init, add, commit, push, pull, branches, merge y resolución de conflictos.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 1,
      devpieceLink: '/git-hacks',
      resources: [
        { label: 'Pro Git Book', url: 'https://git-scm.com/book/es/v2' },
        { label: 'Learn Git Branching', url: 'https://learngitbranching.js.org/?locale=es_ES' },
      ],
    },
  },
  {
    id: 'jr-vscode',
    position: { x: 100, y: 260 },
    data: {
      label: 'VS Code',
      description: 'Configuración esencial, extensiones imprescindibles, atajos de teclado y debugging integrado.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 2,
      devpieceLink: '/vscode',
      resources: [
        { label: 'VS Code Docs', url: 'https://code.visualstudio.com/docs' },
      ],
    },
  },
  {
    id: 'jr-github',
    position: { x: 500, y: 260 },
    data: {
      label: 'GitHub',
      description: 'Pull Requests, Issues, GitHub Flow, code reviews y colaboración en equipos.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 2,
      resources: [
        { label: 'GitHub Skills', url: 'https://skills.github.com' },
        { label: 'GitHub Flow', url: 'https://guides.github.com/introduction/flow/' },
      ],
    },
  },
  {
    id: 'jr-cli',
    position: { x: 300, y: 390 },
    data: {
      label: 'CLI Tools Modernos',
      description: 'bat (cat mejorado), eza (ls mejorado), fzf (fuzzy finder), ripgrep y fd para ser más productivo.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 2,
      devpieceLink: '/cli-tools',
      resources: [
        { label: 'bat', url: 'https://github.com/sharkdp/bat' },
        { label: 'eza', url: 'https://eza.rocks' },
        { label: 'fzf', url: 'https://github.com/junegunn/fzf' },
      ],
    },
  },
  {
    id: 'jr-node',
    position: { x: 100, y: 510 },
    data: {
      label: 'Node.js & npm/pnpm',
      description: 'Gestión de paquetes, scripts en package.json y entender el ecosistema Node.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'pnpm', url: 'https://pnpm.io' },
        { label: 'npm Docs', url: 'https://docs.npmjs.com' },
      ],
    },
  },
  {
    id: 'jr-conventional',
    position: { x: 500, y: 510 },
    data: {
      label: 'Conventional Commits',
      description: 'feat, fix, docs, chore... Mensajes de commit estructurados para un historial limpio.',
      difficulty: 'beginner',
      type: 'concept',
      phase: 3,
      devpieceLink: '/git-hacks',
      resources: [
        { label: 'Conventional Commits', url: 'https://www.conventionalcommits.org/es/v1.0.0/' },
        { label: 'commitlint', url: 'https://commitlint.js.org' },
      ],
    },
  },
  {
    id: 'jr-dotfiles',
    position: { x: 300, y: 630 },
    data: {
      label: 'Dotfiles',
      description: 'Gestionar .zshrc, .bashrc, .gitconfig y otros dotfiles con un repo Git para sincronizar tu entorno.',
      difficulty: 'intermediate',
      type: 'milestone',
      phase: 3,
      devpieceLink: '/dotfiles',
      resources: [
        { label: 'dotfiles.github.io', url: 'https://dotfiles.github.io' },
        { label: 'chezmoi', url: 'https://www.chezmoi.io' },
      ],
    },
  },
  {
    id: 'jr-ssh',
    position: { x: 100, y: 750 },
    data: {
      label: 'SSH & Claves GPG',
      description: 'Generar y gestionar claves SSH, autenticación con GitHub y firma de commits con GPG.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 4,
      resources: [
        { label: 'GitHub SSH Docs', url: 'https://docs.github.com/es/authentication/connecting-to-github-with-ssh' },
      ],
    },
  },
  {
    id: 'jr-linters',
    position: { x: 500, y: 750 },
    data: {
      label: 'Linters & Formatters',
      description: 'ESLint, Biome o Prettier para código consistente. Configurar pre-commit hooks con Husky.',
      difficulty: 'beginner',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'Biome', url: 'https://biomejs.dev' },
        { label: 'Husky', url: 'https://typicode.github.io/husky/' },
      ],
    },
  },
  {
    id: 'jr-done',
    position: { x: 300, y: 870 },
    data: {
      label: 'Setup Completado',
      description: 'Con estas herramientas tienes un entorno de desarrollo profesional desde el primer día.',
      difficulty: 'beginner',
      type: 'milestone',
      phase: 4,
      resources: [],
    },
  },
];

const juniorDevEdges: RoadmapEdge[] = [
  { id: 'e-jr-terminal-git', source: 'jr-terminal', target: 'jr-git', animated: true },
  { id: 'e-jr-git-vscode', source: 'jr-git', target: 'jr-vscode', animated: true },
  { id: 'e-jr-git-github', source: 'jr-git', target: 'jr-github', animated: true },
  { id: 'e-jr-vscode-cli', source: 'jr-vscode', target: 'jr-cli' },
  { id: 'e-jr-github-cli', source: 'jr-github', target: 'jr-cli' },
  { id: 'e-jr-cli-node', source: 'jr-cli', target: 'jr-node', animated: true },
  { id: 'e-jr-cli-conventional', source: 'jr-cli', target: 'jr-conventional' },
  { id: 'e-jr-node-dotfiles', source: 'jr-node', target: 'jr-dotfiles', animated: true },
  { id: 'e-jr-conventional-dotfiles', source: 'jr-conventional', target: 'jr-dotfiles' },
  { id: 'e-jr-dotfiles-ssh', source: 'jr-dotfiles', target: 'jr-ssh', animated: true },
  { id: 'e-jr-dotfiles-linters', source: 'jr-dotfiles', target: 'jr-linters' },
  { id: 'e-jr-ssh-done', source: 'jr-ssh', target: 'jr-done', animated: true },
  { id: 'e-jr-linters-done', source: 'jr-linters', target: 'jr-done' },
];

// ─── NinjaDev (Tools) ─────────────────────────────────────────────────────────
const ninjaDevNodes: RoadmapNode[] = [
  {
    id: 'nj-shell',
    position: { x: 350, y: 0 },
    data: {
      label: 'Shell Avanzado',
      description: 'ZSH con Oh My Zsh o Nushell. Plugins, themes (Starship), aliases y funciones personalizadas.',
      difficulty: 'intermediate',
      type: 'start',
      phase: 1,
      resources: [
        { label: 'Starship Prompt', url: 'https://starship.rs' },
        { label: 'Nushell', url: 'https://www.nushell.sh' },
        { label: 'Oh My Zsh', url: 'https://ohmyz.sh' },
      ],
    },
  },
  {
    id: 'nj-terminal',
    position: { x: 130, y: 130 },
    data: {
      label: 'Terminal Premium',
      description: 'Ghostty o Alacritty para máxima velocidad. Configuración con GPU acceleration y temas custom.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 1,
      devpieceLink: '/terminales',
      resources: [
        { label: 'Ghostty', url: 'https://ghostty.org' },
        { label: 'Alacritty', url: 'https://alacritty.org' },
        { label: 'WezTerm', url: 'https://wezfurlong.org/wezterm/' },
      ],
    },
  },
  {
    id: 'nj-tmux',
    position: { x: 570, y: 130 },
    data: {
      label: 'tmux / Zellij',
      description: 'Multiplexor de terminal. Sesiones persistentes, panes, windows y keybindings custom.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 1,
      resources: [
        { label: 'tmux Wiki', url: 'https://github.com/tmux/tmux/wiki' },
        { label: 'Zellij Docs', url: 'https://zellij.dev/documentation/' },
      ],
    },
  },
  {
    id: 'nj-editor',
    position: { x: 350, y: 270 },
    data: {
      label: 'Editor Ninja',
      description: 'Neovim con LazyVim o VS Code con Vim extension. Modal editing, macros y motion commands.',
      difficulty: 'advanced',
      type: 'tool',
      phase: 2,
      devpieceLink: '/neovim',
      resources: [
        { label: 'LazyVim', url: 'https://www.lazyvim.org' },
        { label: 'Neovim Docs', url: 'https://neovim.io/doc/' },
      ],
    },
  },
  {
    id: 'nj-cli',
    position: { x: 130, y: 390 },
    data: {
      label: 'CLI Tools Avanzados',
      description: 'fzf, ripgrep, fd, bat, eza, zoxide, delta, jq, yq, xh y más herramientas modernas.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 2,
      devpieceLink: '/cli-tools',
      resources: [
        { label: 'Modern Unix', url: 'https://github.com/ibraheemdev/modern-unix' },
        { label: 'zoxide', url: 'https://github.com/ajeetdsouza/zoxide' },
      ],
    },
  },
  {
    id: 'nj-git',
    position: { x: 570, y: 390 },
    data: {
      label: 'Git Avanzado',
      description: 'Rebase interactivo, cherry-pick, bisect, worktrees, hooks y workflows de équipo.',
      difficulty: 'advanced',
      type: 'concept',
      phase: 2,
      devpieceLink: '/git-hacks',
      resources: [
        { label: 'Git Power Tools', url: 'https://git-scm.com/book/es/v2' },
        { label: 'Lazygit', url: 'https://github.com/jesseduffield/lazygit' },
      ],
    },
  },
  {
    id: 'nj-docker',
    position: { x: 350, y: 510 },
    data: {
      label: 'Docker Avanzado',
      description: 'Multi-stage builds, Docker Compose v2, redes personalizadas y optimización de imágenes.',
      difficulty: 'advanced',
      type: 'tool',
      phase: 3,
      devpieceLink: '/docker',
      resources: [
        { label: 'Docker Best Practices', url: 'https://docs.docker.com/build/building/best-practices/' },
        { label: 'Dive Tool', url: 'https://github.com/wagoodman/dive' },
      ],
    },
  },
  {
    id: 'nj-scripts',
    position: { x: 130, y: 630 },
    data: {
      label: 'Scripting & Automatización',
      description: 'Scripts bash/zsh para tareas repetitivas, just/make para task runners y automatización del flujo.',
      difficulty: 'intermediate',
      type: 'concept',
      phase: 3,
      resources: [
        { label: 'Just (task runner)', url: 'https://github.com/casey/just' },
        { label: 'Bash Guide', url: 'https://mywiki.wooledge.org/BashGuide' },
      ],
    },
  },
  {
    id: 'nj-ai',
    position: { x: 570, y: 630 },
    data: {
      label: 'AI Tools',
      description: 'Claude Code, GitHub Copilot, Cursor o Zed AI para pair programming con IA.',
      difficulty: 'intermediate',
      type: 'tool',
      phase: 3,
      devpieceLink: '/ai-tools',
      resources: [
        { label: 'Claude Code', url: 'https://claude.ai/code' },
        { label: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
      ],
    },
  },
  {
    id: 'nj-dotfiles',
    position: { x: 350, y: 750 },
    data: {
      label: 'Dotfiles Ninja',
      description: 'Gestión con chezmoi o GNU Stow. Sincronización cross-platform, secrets con age/gpg y bootstrap scripts.',
      difficulty: 'advanced',
      type: 'milestone',
      phase: 3,
      devpieceLink: '/dotfiles',
      resources: [
        { label: 'chezmoi', url: 'https://www.chezmoi.io' },
        { label: 'GNU Stow', url: 'https://www.gnu.org/software/stow/' },
      ],
    },
  },
  {
    id: 'nj-tui',
    position: { x: 130, y: 870 },
    data: {
      label: 'TUI Apps',
      description: 'lazygit, lazydocker, k9s, yazi (file manager) y btop para vivir en la terminal.',
      difficulty: 'advanced',
      type: 'tool',
      phase: 4,
      resources: [
        { label: 'Lazygit', url: 'https://github.com/jesseduffield/lazygit' },
        { label: 'yazi', url: 'https://yazi-rs.github.io' },
        { label: 'btop', url: 'https://github.com/aristocratos/btop' },
      ],
    },
  },
  {
    id: 'nj-flow',
    position: { x: 570, y: 870 },
    data: {
      label: 'Flujo de Trabajo',
      description: 'Integrar todo: terminal, editor, git, docker y AI en un workflow de desarrollo cohesionado.',
      difficulty: 'advanced',
      type: 'concept',
      phase: 4,
      resources: [
        { label: 'Roadmap.sh DevOps', url: 'https://roadmap.sh/devops' },
      ],
    },
  },
  {
    id: 'nj-done',
    position: { x: 350, y: 990 },
    data: {
      label: 'Ninja Level',
      description: 'Tienes un entorno de desarrollo que hace que tus compañeros te pregunten cómo trabajas.',
      difficulty: 'advanced',
      type: 'milestone',
      phase: 4,
      resources: [],
    },
  },
];

const ninjaDevEdges: RoadmapEdge[] = [
  { id: 'e-nj-shell-terminal', source: 'nj-shell', target: 'nj-terminal', animated: true },
  { id: 'e-nj-shell-tmux', source: 'nj-shell', target: 'nj-tmux', animated: true },
  { id: 'e-nj-terminal-editor', source: 'nj-terminal', target: 'nj-editor', animated: true },
  { id: 'e-nj-tmux-editor', source: 'nj-tmux', target: 'nj-editor' },
  { id: 'e-nj-editor-cli', source: 'nj-editor', target: 'nj-cli', animated: true },
  { id: 'e-nj-editor-git', source: 'nj-editor', target: 'nj-git', animated: true },
  { id: 'e-nj-cli-docker', source: 'nj-cli', target: 'nj-docker', animated: true },
  { id: 'e-nj-git-docker', source: 'nj-git', target: 'nj-docker' },
  { id: 'e-nj-docker-scripts', source: 'nj-docker', target: 'nj-scripts', animated: true },
  { id: 'e-nj-docker-ai', source: 'nj-docker', target: 'nj-ai' },
  { id: 'e-nj-scripts-dotfiles', source: 'nj-scripts', target: 'nj-dotfiles', animated: true },
  { id: 'e-nj-ai-dotfiles', source: 'nj-ai', target: 'nj-dotfiles' },
  { id: 'e-nj-dotfiles-tui', source: 'nj-dotfiles', target: 'nj-tui', animated: true },
  { id: 'e-nj-dotfiles-flow', source: 'nj-dotfiles', target: 'nj-flow' },
  { id: 'e-nj-tui-done', source: 'nj-tui', target: 'nj-done', animated: true },
  { id: 'e-nj-flow-done', source: 'nj-flow', target: 'nj-done' },
];

// ─── Export ───────────────────────────────────────────────────────────────────
export const ROADMAPS: RoadmapDef[] = [
  {
    slug: 'frontend',
    label: 'Frontend Dev',
    description: 'De HTML hasta Next.js y deploy. La ruta completa para convertirte en un desarrollador frontend moderno.',
    accent: '#8caaee',
    icon: '🖥️',
    type: 'tech',
    nodes: frontDevNodes,
    edges: frontDevEdges,
  },
  {
    slug: 'backend',
    label: 'Backend Dev',
    description: 'Node.js, bases de datos, APIs, autenticación, Docker y CI/CD. Todo lo que necesitas en el servidor.',
    accent: '#a6d189',
    icon: '⚙️',
    type: 'tech',
    nodes: backDevNodes,
    edges: backDevEdges,
  },
  {
    slug: 'fullstack',
    label: 'Full Stack Dev',
    description: 'Frontend + Backend + DevOps básico. La ruta completa para dominar toda la stack de desarrollo.',
    accent: '#ca9ee6',
    icon: '🚀',
    type: 'tech',
    nodes: fullDevNodes,
    edges: fullDevEdges,
  },
  {
    slug: 'junior-setup',
    label: 'Junior Dev Setup',
    description: 'El setup esencial para tu primer trabajo. Terminal, Git, VS Code y las herramientas que todo dev necesita.',
    accent: '#ef9f76',
    icon: '🌱',
    type: 'tools',
    nodes: juniorDevNodes,
    edges: juniorDevEdges,
  },
  {
    slug: 'ninja-setup',
    label: 'Ninja Dev Setup',
    description: 'El setup de un desarrollador experto. Neovim, terminal premium, dotfiles ninja y flujo de trabajo máximo.',
    accent: '#f4b8e4',
    icon: '⚡',
    type: 'tools',
    nodes: ninjaDevNodes,
    edges: ninjaDevEdges,
  },
];

export function getRoadmapBySlug(slug: string): RoadmapDef | undefined {
  return ROADMAPS.find((r) => r.slug === slug);
}
