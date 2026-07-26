# @nera-static/plugin-canonical-links

[![Test](https://github.com/seebaermichi/nera-plugin-canonical-links/actions/workflows/test.yml/badge.svg)](https://github.com/seebaermichi/nera-plugin-canonical-links/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-canonical-links)](https://www.npmjs.com/package/@nera-static/plugin-canonical-links)

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator to generate canonical and alternate `<link>` tags for SEO in the document `<head>`. Helps search engines correctly index content across domains and languages.

📖 **Documentation:** [nera.js.org](https://nera.js.org)

## ✨ Features

- Adds `<link rel="canonical">` for SEO
- Supports multilingual alternate links
- Easy Pug template integration
- Configurable origin and slug mapping

## 🚀 Installation

Install the plugin in the root of your Nera project:

```bash
npm install @nera-static/plugin-canonical-links
```

Nera will automatically detect the plugin and apply it during the build.

## ⚙️ Configuration

Create `config/canonical-links.yaml`:

```yaml
app_origin: https://your-domain.com
page_identifier: slug
available_languages:
    - en
    - es
    - fr
```

- `app_origin`: The canonical base URL. Used as a fallback — if `origin` is
  set in `config/app.yaml`, **that wins**. A trailing slash is stripped, so
  `https://your-domain.com/` and `https://your-domain.com` behave identically.
- `page_identifier`: Shared key to match localized versions (defaults to `slug`).
- `available_languages`: List of supported language codes, used to create
  alternate links. **Omitting it disables alternate links entirely** — you
  get canonical tags only, with no warning.

**The config file is optional.** If `origin` is set in `config/app.yaml` you can
skip it entirely and still get canonical links; you need this file only for
`available_languages` or a custom `page_identifier`. The
`config/canonical-links.yaml` shipped inside the package is documentation only —
Nera reads config from *your* project and never merges the two.

If neither `app.origin` nor `app_origin` resolves, the plugin generates no
canonical links at all and prints a warning. Earlier versions emitted
`<link rel="canonical" href="undefined/…">` in that case.

## 🧩 Usage

Include the published view in your layout head:

```pug
head
    include /vendor/plugin-canonical-links/index
```

The leading slash makes this **root-absolute**: it resolves against your
`views/` directory regardless of where the including file sits. It requires
Nera **v4.3.0+**. On v4.1.x–v4.2.x, use the relative form instead — the path is
then relative to the **including file**, so this assumes a layout in
`views/layouts/`:

```pug
head
    include ../vendor/plugin-canonical-links/index
```

A bare `include vendor/plugin-canonical-links/index` (no leading slash) is
**not** equivalent: from `views/layouts/` it resolves to
`views/layouts/vendor/…` and fails the build.

## 🛠️ Template Publishing

Copy the plugin's templates into your project:

```bash
npx nera-canonical-links
```

This copies `index.pug` and its `partials/` to:

```
views/vendor/plugin-canonical-links/
```

Publishing **skips** if that directory already exists, so your edits are never
overwritten. To pull in updated templates after an upgrade, discarding your
changes to them, use `npx nera-canonical-links --force`.

> Because the skip is on the **directory**, an upgrade that changes a template
> reaches your site only when you re-run with `--force`. Upgrading without it is
> safe — the new markup simply never appears. Diff your published copies first
> if you have customised them.

## 📊 Generated Output

For an English page with Spanish and French translations:

```html
<link href="https://example.com/index.html" rel="canonical" />
<link href="https://example.com/es/index.html" hreflang="es" rel="alternate" />
<link href="https://example.com/fr/index.html" hreflang="fr" rel="alternate" />
```

The templates emit `link` elements only, with no `class` attributes — there is
nothing to style, and nothing here is a CSS contract.

### Data written to each page

If you write your own template instead of publishing the shipped one, these are
the keys to read:

- `meta.canonicalLink` — `{ href, rel }`, where `rel` is always `'canonical'`.
- `meta.alternateLinks` — an array of `{ href, hreflang, rel }`, where `rel` is
  always `'alternate'`.

Two cases to guard for:

- With no `available_languages`, `meta.alternateLinks` is an **empty array**,
  not absent.
- When **no origin resolves**, both keys are **absent entirely**. The shipped
  partials already guard for this; a hand-written template that does not will
  throw during the build.

## 🗂️ Content Structure

To use alternate links, provide a shared identifier (e.g., `slug`) across translations:

```
pages/
├── index.md
├── es/
│   └── index.md
└── fr/
    └── index.md
```

Example frontmatter for each:

**pages/index.md**

```yaml
lang: en
slug: home
```

**pages/es/index.md**

```yaml
lang: es
slug: home
```

**pages/fr/index.md**

```yaml
lang: fr
slug: home
```

### Frontmatter requirements

These are rules, not just conventions in the example above:

- A page must set **`lang`**. Without it the page still gets a canonical link,
  but **no alternate links at all**, silently.
- Translations must set an **identical `page_identifier` value** (`slug` by
  default). Pages that omit the key are never matched to anything — they get a
  canonical link and an empty `alternateLinks`.

### Pages generated by other plugins

Plugins run in the order `start:` → alphabetical → `end:`, from
`config/plugin-order.yaml`. `plugin-canonical-links` sorts alphabetically before
plugins that **generate** pages — notably
[`plugin-tags`](https://www.npmjs.com/package/@nera-static/plugin-tags), which
creates its tag-overview pages while it runs. Those pages are created after this
plugin has already finished, so **they receive no canonical link at all**.

If you use such a plugin, run this one at the end instead:

```yaml
# config/plugin-order.yaml
plugin-order:
    - end:
          - plugin-canonical-links
          - plugin-search
```

`config/plugin-order.yaml` is honoured from Nera **v4.2.0+**; on earlier
versions the file is ignored. Generated pages carry no frontmatter identifier,
so they get a canonical link and no alternates.

## 🧩 Rendering Details

The plugin provides a view file that includes two partials:

- `views/index.pug`

    ```pug
    include partials/canonical-link
    include partials/alternate-links
    ```

- `views/partials/canonical-link.pug`

    ```pug
    if (meta.canonicalLink)
        link(href=meta.canonicalLink.href, rel=meta.canonicalLink.rel)
    ```

- `views/partials/alternate-links.pug`
    ```pug
    if (meta.alternateLinks && meta.alternateLinks.length > 0)
        each alternate in meta.alternateLinks
            link(href=alternate.href, hreflang=alternate.hreflang, rel=alternate.rel)
    ```

Publish them (see above) and customize the copies for full control.

## 🧪 Development

```bash
npm install
npx vitest run
npm run lint
```

`npm test` starts Vitest in **watch** mode; use `npx vitest run` for a single
pass. Includes unit and integration tests using [Vitest](https://vitest.dev) and
[Pug](https://pugjs.org).

## 🤝 Contributing

Issues and pull requests are welcome. See the
[Nera contributing guide](https://github.com/seebaermichi/nera/blob/main/CONTRIBUTING.md)
for plugin development, the hook contract, and local setup.

For this repo specifically:

- `npx vitest run` and `npm run lint` must pass (`npm test` is watch mode).
- Bump the version and update `CHANGELOG.md` **in the same commit** as the change.
- The template markup is a **public contract** — users publish copies into
  `views/vendor/plugin-canonical-links/` and include them from their own
  layouts, so changing what the templates emit is a **major** bump.
- Releases publish from CI on a pushed `v*` tag. Never run `npm publish`.

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

- [Plugin Repository](https://github.com/seebaermichi/nera-plugin-canonical-links)
- [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-canonical-links)
- [Nera Website](https://nera.js.org)
- [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## 🧩 Compatibility

- **Nera**: v4.3.0+ for the root-absolute `include /vendor/…` shown in Usage,
  which needs the Pug `basedir` the generator began setting in 4.3.0. The
  plugin itself needs nothing above the 4.x baseline — on v4.1.x–v4.2.x use the
  relative include. The `config/plugin-order.yaml` advice above needs v4.2.0+.
- **Node.js**: >= 20.0.0
- **Plugin Utils**: `^1.2.0` — `npx nera-canonical-links` calls
  `publishAllTemplates`, added in 1.2.0, which is what copies `partials/`
  alongside `index.pug`.
- **Plugin API**: exports `getMetaData()`, which writes per-page data.

## 📦 License

MIT
