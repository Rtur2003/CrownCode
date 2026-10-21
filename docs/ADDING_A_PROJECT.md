# Adding a project

A project on this site is three things: an entry in the catalog, a page, and its text in both languages. Everything else (the world in the homepage atlas, the header menu, the "back to the atlas" badge, search, the sitemap, structured data and the social image) is derived from the catalog entry. Nothing in those places is edited by hand.

## The short way

From `platform/`:

```bash
node scripts/new-project.mjs --route my-tool --name "My Tool" --icon Wrench
```

Add `--dry-run` first to see what it would write. It creates the page from the shared template, adds the catalog entry, writes placeholder text into both locale files and adds a social card to `scripts/generate-og-images.mjs`. Then:

1. Replace every `TODO` in `locales/en.json` and `locales/tr.json`, under `products.items.<key>`.
2. Build the tool in `pages/my-tool/index.tsx`.
3. Give the social card its line in `scripts/generate-og-images.mjs` and run `node scripts/generate-og-images.mjs`.
4. Run `npx jest __tests__/config`. When it is green the project is complete.

The tests stay red until the page, the text, the schema, the sitemap date and the social image all exist, and they name what is missing.

## What a catalog entry holds

`config/product-catalog.ts`, one object per project:

| Field | Meaning |
| --- | --- |
| `id`, `localeKey`, `href` | Stable id, the key under `products.items`, the route. A route starting with `https:` links out and has no page here. |
| `icon`, `gradient` | A lucide icon and the colours used where a card is drawn. |
| `name` | The project's own name, only when it is not the part of the title before the colon (`VOTRYX`, `ML Toolkit`). |
| `schema` | What schema.org should say about the page (`category`, `os`, optionally `type` and `sameAs`). |
| `updated` | The date the page's content last changed. It becomes the sitemap `lastmod`; change it with the edit. |

The order of the list is the order of the route through the atlas, the header menu and the badge's previous and next links.

## The text

Each project has `products.items.<localeKey>` in both locale files:

- `title`: the name, then a colon, then what it does. The part before the colon is the short name.
- `description`: one or two plain sentences, used for the page and for search.
- `showroomDescription`: one sentence for the atlas.
- `status`: empty, unless something is worth saying (in development, experimental).
- `stats`: the kind of thing it is, for example `Web · Audio datasets`.

`node scripts/check-locale-parity.mjs` checks that both languages have the same keys.

## The look

A project with no hand-tuned look gets a palette derived from its id and the generic planet picture, so adding one never needs an image. To give it its own planet:

1. Render it with `scripts/capture-atlas-assets.py`, which writes `public/images/atlas/world-<id>.webp`.
2. Add the id to `RENDERED_WORLDS` in `config/showroom-worlds.ts`. A test fails if the set and the files disagree.
3. Optionally add a hand-tuned entry for it in `LOOKS` in the same file.

## The page

Use `WorldPage` (`components/UI/WorldPage.tsx`) and the shared classes in `styles/components/world-page.module.css`: `section`, `sectionHead`, `sectionBody`, `field`, `input`, `primary`, `link`, `reading`, `margins`. A page that needs a few rules of its own gets a small module next to the others in `styles/pages/`. Do not copy a section layout into a new stylesheet.

A tool that talks to the backend:

- Put `<BackendNote />` above its form. The free Space sleeps and needs a minute or two to wake, and the note says so.
- Send requests with `fetchWithTimeout` and an `AbortController`, ignore answers that arrive after a newer request, and turn 413, 429, 503 and network failures into a plain message in the page's own language. `hooks/useDatasetTool.ts` is a worked example.
- Keep the page working with the backend down: say what happened, keep the user's input.

## The rules

They are enforced by `__tests__/config/design-rules.test.ts`, so a page that breaks one fails before review.

- No numbered markers (`03 / 08`, `01`, `02`), no counters that are not real data.
- No tracked all-caps labels, no small label above every heading. Headings are plain sentences.
- No gradient text, no coloured stripe down one side of a box, no pills or chips where a line of text will do.
- No emoji as icons, no exclamation marks, no dashes used as punctuation in the copy.
- Text says what a thing does. If a sentence would fit any other product, rewrite it.
- Anything a number is shown for is a number the page actually has.

## What was checked, and where

| Check | File |
| --- | --- |
| A project is complete (page, text, schema, sitemap, social image, look) | `__tests__/config/project-integrity.test.ts` |
| The house rules above | `__tests__/config/design-rules.test.ts` |
| Every page is classified as indexable or not | `__tests__/config/seo.test.tsx` |
| Both languages have the same text keys | `scripts/check-locale-parity.mjs` |
