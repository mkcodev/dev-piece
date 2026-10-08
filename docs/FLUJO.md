# Flujo de trabajo

Una unidad de trabajo = un issue = una rama = una PR. Nunca se commitea directo a `main`.

1. **Issue.** Cada fase, bug o bloque de contenido tiene su issue (plantillas en `.github/ISSUE_TEMPLATE`).
2. **Rama.** Desde `main` actualizado, con el número del issue: `feat/12-sidebar-rail`, `fix/15-drawer-movil`, `content/20-nuevas-cli`.
3. **Commits pequeños** dentro de la rama, con mensaje que explique el porqué. Prefijos: `feat:`, `fix:`, `content:`, `docs:`, `chore:`.
4. **PR** hacia `main` con la plantilla; el cuerpo lleva `Closes #N` para cerrar el issue al fusionar.
5. **CI** (`.github/workflows/ci.yml`) ejecuta `pnpm build`, que valida los esquemas Zod del contenido y los tipos. La PR no se fusiona en rojo.
6. **Fusión** con "Squash and merge" para que `main` conserve un commit por PR; se borra la rama.

## Reglas del proyecto

- Las claves `devpiece-*` de localStorage son un contrato con los usuarios: no se renombran.
- Renombrar un MDX o una categoría cambia URLs y rompe arsenales guardados.
- Todo el texto de UI va en español.
- Si cambia el número de herramientas, categorías, guías o roadmaps, se actualizan README y CLAUDE.md en la misma PR.

## Deploy (Vercel)

El repo está conectado a Vercel: cada PR genera un deploy de preview y cada merge a `main` despliega a
producción en https://devpiece.vercel.app. El sitio es 100% estático (`output: 'static'`).
