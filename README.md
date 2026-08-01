# Social Sanvad

महाराष्ट्रातील राजकीय डिजिटल संवादाचे ज्ञानकेंद्र.

Marathi-first digital publication helping political leaders, karyakartas, and social organizations improve digital communication.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- MDX (`content/articles`)
- Framer Motion
- next-themes (dark mode)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

Add articles as MDX files in `content/articles/` with frontmatter:

```yaml
title: "..."
description: "..."
slug: "..."
category: "social-media" # ai | whatsapp | election | digital-tools | case-study
tags: []
author: "Social Sanvad"
publishedAt: "2026-01-01"
featured: false
popular: false
```

Articles are text-first — no featured images.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

## Deploy

Deploy on Vercel. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
