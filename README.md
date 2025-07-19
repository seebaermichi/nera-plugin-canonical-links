# @nera-static/plugin-canonical-links

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

-   `app_origin`: The canonical base URL (overrides `app.origin`).
-   `page_identifier`: Shared key to match localized versions (defaults to `slug`).
-   `available_languages`: List of supported language codes (used to create alternate links).

## 📄 Usage in Templates

Include the plugin’s view in your layout head:

```pug
head
    include /node_modules/@nera-static/plugin-canonical-links/views/index
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

You can copy or customize these templates for full control.

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

## 📦 License

MIT
