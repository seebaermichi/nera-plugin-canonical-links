import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

// Resolved per call rather than at module scope: the host project's cwd is
// what matters, and resolving lazily is what makes this testable.
function getHostConfig() {
    return getConfig(path.resolve(process.cwd(), 'config/canonical-links.yaml'))
}

/**
 * The canonical base URL. `app.origin` from config/app.yaml wins over the
 * plugin's own `app_origin` — the opposite of what the README claimed
 * before 2.1.0.
 */
function getOrigin(data, config) {
    const origin = data.app?.origin || config.app_origin

    // A trailing slash would produce `https://example.com//page.html`, since
    // meta.href already starts with one — a duplicate URL handed to search
    // engines as the authoritative one, which is the thing this plugin exists
    // to prevent.
    return typeof origin === 'string' ? origin.replace(/\/+$/, '') : origin
}

function getAlternates(pageMeta, data, config, origin) {
    const pageIdentifier = config.page_identifier || 'slug'
    const availableLanguages = config.available_languages || []
    const multiLangCanonicals = []
    const identifier = pageMeta[pageIdentifier]

    // Without an identifier there is nothing to match translations on.
    // Comparing the raw values would make `undefined === undefined` true, so
    // every page missing the key was declared a translation of the first
    // other-language page that was also missing it — including the pages other
    // plugins generate, which never carry one.
    if (identifier === undefined || identifier === null) {
        return multiLangCanonicals
    }

    availableLanguages.forEach((availableLang) => {
        if (pageMeta.lang && availableLang !== pageMeta.lang) {
            const relCanonical = data.pagesData.find(
                ({ meta }) =>
                    meta.lang === availableLang &&
                    meta[pageIdentifier] === identifier
            )

            if (relCanonical) {
                multiLangCanonicals.push({
                    href: `${origin}${relCanonical.meta.href}`,
                    hreflang: availableLang,
                    rel: 'alternate',
                })
            }
        }
    })

    return multiLangCanonicals
}

function getCanonical(meta, origin) {
    return {
        href: `${origin}${meta.href}`,
        rel: 'canonical',
    }
}

export function getMetaData(data) {
    const config = getHostConfig()
    const origin = getOrigin(data, config)

    // Without an origin every page used to get
    // <link rel="canonical" href="undefined/blog/post.html">, which is worse
    // than emitting nothing at all — it hands search engines a broken URL as
    // the authoritative one. Bail out loudly instead.
    if (!origin) {
        console.warn(
            '⚠️ plugin-canonical-links: no origin configured, so no canonical links were generated.\n' +
                '    Set `origin` in config/app.yaml, or `app_origin` in config/canonical-links.yaml.'
        )
        return data.pagesData
    }

    return data.pagesData.map(({ content, meta }) => {
        return {
            content,
            meta: Object.assign({}, meta, {
                canonicalLink: getCanonical(meta, origin),
                alternateLinks: getAlternates(meta, data, config, origin),
            }),
        }
    })
}
