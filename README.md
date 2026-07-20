# @nera-static/plugin-canonical-links

[![Test](https://github.com/seebaermichi/nera-plugin-canonical-links/actions/workflows/test.yml/badge.svg)](https://github.com/seebaermichi/nera-plugin-canonical-links/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-canonical-links)](https://www.npmjs.com/package/@nera-static/plugin-canonical-links)

A plugin for the [Nera](https://github.com/seebaermichi/nera) static site generator to generate canonical and alternate `<link>` tags for SEO in the document `<head>`. Helps search engines correctly index content across domains and languages.

## ✨ Features

-   Adds `<link rel="canonical">` for SEO
-   Supports multilingual alternate links
-   Easy Pug template integration
-   Configurable origin and slug mapping

## 🚀 Installation

Install the plugin in the root of your Nera project:

```bash
npm install @nera-static/plugin-canonical-links
```

Then create a config file in your project’s `config/` directory:

```
config/
└── canonical-links.yaml
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

-   `app_origin`: The canonical base URL. Used as a fallback — if `origin` is
    set in `config/app.yaml`, **that wins**.
-   `page_identifier`: Shared key to match localized versions (defaults to `slug`).
-   `available_languages`: List of supported language codes, used to create
    alternate links. **Omitting it disables alternate links entirely** — you
    get canonical tags only, with no warning.

If neither `app.origin` nor `app_origin` resolves, the plugin generates no
canonical links at all and prints a warning. Earlier versions emitted
`<link rel="canonical" href="undefined/…">` in that case.

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

## 📄 Usage in Templates

Include the published view in your layout head:

```pug
head
    include vendor/plugin-canonical-links/index
```

This will generate:

```html
<link href="https://example.com/index.html" rel="canonical" />
<link href="https://example.com/es/index.html" hreflang="es" rel="alternate" />
<link href="https://example.com/fr/index.html" hreflang="fr" rel="alternate" />
```

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

## 🧩 Rendering Details

The plugin provides a view file that includes two partials:

-   `views/index.pug`

    ```pug
    include partials/canonical-link
    include partials/alternate-links
    ```

-   `views/partials/canonical-link.pug`

    ```pug
    if (meta.canonicalLink)
        link(href=meta.canonicalLink.href, rel=meta.canonicalLink.rel)
    ```

-   `views/partials/alternate-links.pug`
    ```pug
    if (meta.alternateLinks && meta.alternateLinks.length > 0)
        each alternate in meta.alternateLinks
            link(href=alternate.href, hreflang=alternate.hreflang, rel=alternate.rel)
    ```

Publish them (see above) and customize the copies for full control.

## 🧪 Development

```bash
npm install
npm run test
```

Includes unit and integration tests using [Vitest](https://vitest.dev) and [Pug](https://pugjs.org).

## 🧑‍💻 Author

Michael Becker  
[https://github.com/seebaermichi](https://github.com/seebaermichi)

## 🔗 Links

-   [Plugin Repository](https://github.com/seebaermichi/nera-plugin-canonical-links)
-   [NPM Package](https://www.npmjs.com/package/@nera-static/plugin-canonical-links)
-   [Nera Static Site Generator](https://github.com/seebaermichi/nera)

## � Compatibility

-   **Nera**: v4.1.0+
-   **Node.js**: >= 18
-   **Plugin API**: Uses `getMetaData()` for optimal performance

## �📦 License

MIT
