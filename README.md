# Canonical links - Nera plugin
This plugin allows you to create canonical links in the head of your Nera website. These links help search engines to recognize same content of different domains, e.g. _www.domain.com_ and _domain.com_ and same content in different languages.

Depending on your website this plugin provides something like this:
```html
<link href="https://example.com/index.html" rel="canonical"/>
<link href="https://example.com/es/index.html" hreflang="es" rel="alternate"/>
<link href="https://example.com/fr/index.html" hreflang="fr" rel="alternate"/>
```

## Installation
To install this plugin, just clone this repo into the `plugins` folder of your Nera website.
```bash
git clone git@github.com:seebaermichi/nera-plugin-canonical-links.git canonical-links
```
Remove the `.git` folder:
```bash
rm -fr src/plugins/canonical-links/.git
```

## Usage
### Canonical link
To add the canonical link to your Nera website head you need to provide the origin of your website in your app config file:  
_`config/app.yaml`_
```yaml
origin: https://your-domain.com
```
or in the plugin config file:
_`src/plugins/canonical-links/config/canonical-links.yaml`_
```yaml
app_origin: https://your-domain.com
```
Next you just need to include the template in your the head of your Nera website.
_`views/layouts/layout.pug`_
```pug
head
    include ../../src/plugins/canonical-links/views/index
```

### Alternate links
If you have the same or similar content in different languages, you might want to have the alternate link feature of this plugin as well.  
To use it you need to make sure, that every page you want to cover has the `lang` property and a property which will act as an identifier for the same or similar content. This plugin would look for the `slug` property by default, but you can configure another one in the plugins config file `src/plugins/canonical-links/config/canonical-links.yaml`.

If we take the above two links as an example, let's see what needs to be setup to achieve this.  
Of course we would have three `index.md` files:
```
|-- pages
    |-- index.md
    |-- es
        |-- index.md
    |-- fr
        |-- index.md
```
The meta section of each index file should look like this:
_`pages/index.md`_
```markdown
---
lang: en
slug: home
others: ...
---
content
```

_`pages/es/index.md`_
```markdown
---
lang: es
slug: home
others: ...
---
content
```

_`pages/fr/index.md`_
```markdown
---
lang: fr
slug: home
others: ...
---
content
```

That's all it needs. Now Nera will know which content is related and will create the appropriate alternate links for each of these three pages.
