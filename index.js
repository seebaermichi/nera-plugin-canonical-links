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
    return data.app?.origin || config.app_origin
}

function getAlternates(pageMeta, data, config, origin) {
    const pageIdentifier = config.page_identifier || 'slug'
    const availableLanguages = config.available_languages || []
    const multiLangCanonicals = []

    availableLanguages.forEach((availableLang) => {
        if (pageMeta.lang && availableLang !== pageMeta.lang) {
            const relCanonical = data.pagesData.find(
                ({ meta }) =>
                    meta.lang === availableLang &&
                    meta[pageIdentifier] === pageMeta[pageIdentifier]
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
