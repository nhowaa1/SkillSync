# SkillSync Next.js Conversion

This is a clean Next.js + Tailwind CSS version of the original single-file SkillSync HTML app.

## What changed from the old HTML file

- The Tailwind CDN script was removed. Tailwind is now configured through `tailwind.config.ts` and `app/globals.css`.
- The old `_sdk/element_sdk.js` and `_sdk/data_sdk.js` scripts were removed because they are not part of a normal Next.js project.
- Old inline handlers like `onclick="showAssessment()"` were replaced with React `onClick` handlers.
- Old DOM code such as `document.getElementById(...)` and `innerHTML` was replaced with React state and JSX rendering.
- The assessment pages, progress bar, radio buttons, validation, scoring, and results page are now controlled by React state.

## How to run

1. Install Node.js LTS from https://nodejs.org/
2. Open this folder in VS Code.
3. Open the VS Code terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open this URL in your browser:

```bash
http://localhost:3000
```

## Important

Do not use VS Code Live Server for this Next.js project. Use `npm run dev` instead.

## Main files

- `app/page.tsx` - main SkillSync app logic and UI
- `app/layout.tsx` - page metadata and fonts
- `app/globals.css` - Tailwind imports and custom animations/styles
- `tailwind.config.ts` - custom navy and teal colors
- `package.json` - project dependencies and scripts
