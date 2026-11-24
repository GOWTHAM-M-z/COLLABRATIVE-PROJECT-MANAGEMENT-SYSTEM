# Integrating `SignInPage` (sign-in-flow-1)

## 1. Project prerequisites

This component needs a **Next.js + TypeScript + Tailwind CSS** project with the shadcn
folder convention (`@/components/ui`, `@/lib/utils`). If you don't have that yet:

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd my-app
npx shadcn@latest init
```

During `shadcn init`, accept the defaults — this creates `components.json`, sets
`@/components/ui` as the components path, and creates `lib/utils.ts` with the `cn()`
helper (used everywhere in this component).

> **Why `components/ui` specifically?** shadcn's CLI, and any shadcn component you
> add later, all assume this exact path for both components and the `cn()` utility.
> If your project uses a different path (e.g. `src/components`), either update your
> `@/*` import alias in `tsconfig.json` to point there, or move these files to match
> your existing alias — don't silently place them in a folder your aliases don't
> resolve to, or every import will break at build time.

If Tailwind isn't set up already:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

If TypeScript isn't set up already:
```bash
npm install -D typescript @types/react @types/node
```

## 2. Install the component's dependencies

This component uses Framer Motion for transitions and React Three Fiber (+ three.js)
for the animated dot-matrix/shader background:

```bash
npm install three @react-three/fiber framer-motion
npm install -D @types/three
```

`next` and `react`/`react-dom` are assumed to already be present since this is a
Next.js component (`"use client"` directive, `next/link`).

## 3. Copy the files

```
your-app/
├── components/
│   └── ui/
│       ├── sign-in-flow-1.tsx   ← main component (already included below)
│       └── demo.tsx              ← usage example
└── lib/
    └── utils.ts                  ← cn() helper (skip if shadcn init already created it)
```

Files are included in this delivery at the matching paths — just copy the
`components/` and `lib/` folders into your project root (merge `lib/utils.ts` if you
already have one; don't overwrite an existing `cn()` implementation without checking
it matches).

## 4. Notes on props / state / behavior

- **Props:** `SignInPage` takes one optional prop, `className?: string`, for
  outer-wrapper styling overrides. No required props — it's fully self-contained.
- **State:** all internal (`email`, `step`, 6-digit `code` array, canvas-visibility
  flags). No external state management or context provider needed.
- **Assets:** none required — there are no `<img>` tags. The "G" in "Sign in with
  Google" is plain text, not an icon; swap in a `lucide-react` icon or an SVG
  logo if you want a real Google mark.
- **Auth logic:** `handleEmailSubmit` and the code-completion check only manage
  local UI state (which "step" is shown) — there's no real authentication call.
  Wire up your actual auth provider (NextAuth, Clerk, Supabase, etc.) inside
  `handleEmailSubmit` and inside the "code complete" branch of `handleCodeChange`.
- **Responsive behavior:** built mobile-first with `sm:` breakpoints on the nav;
  the form column stacks full-width on small screens and centers on `lg:`+.
- **Where to use it:** typically as a full route, e.g. `app/sign-in/page.tsx`:

  ```tsx
  import { SignInPage } from "@/components/ui/sign-in-flow-1";

  export default function Page() {
    return <SignInPage />;
  }
  ```

  Since it renders `min-h-screen` and manages its own background, don't nest it
  inside a layout that adds its own padding/scroll container — give it the
  whole viewport.

## 5. Run it

```bash
npm run dev
```

Visit `/sign-in` (or wherever you mounted `<SignInPage />`) and you should see the
animated dot-matrix background, the email step, the 6-digit code step (any digits
work — there's no real verification), and the success step.
