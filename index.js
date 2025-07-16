import path from 'path'
import { getConfig } from '@nera-static/plugin-utils'

const HOST_CONFIG_PATH = path.resolve(
    process.cwd(),
    'config/canonical-links.yaml'
)

const config = getConfig(HOST_CONFIG_PATH)

function getOrigin(data) {
    return data.app.origin || config.app_origin
}

function getAlternates(pageMeta, data) {
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
                    href: `${getOrigin(data)}${relCanonical.meta.href}`,
                    hreflang: availableLang,
                    rel: 'alternate',
                })
            }
        }
    })

    return multiLangCanonicals
}

function getCanonical(meta, data) {
    return {
        href: `${getOrigin(data)}${meta.href}`,
        rel: 'canonical',
    }
}

export function getMetaData(data) {
    if (!config) {
        return data.pagesData
    }

    return data.pagesData.map(({ content, meta }) => {
        return {
            content,
            meta: Object.assign({}, meta, {
                canonicalLink: getCanonical(meta, data),
                alternateLinks: getAlternates(meta, data),
            }),
        }
    })
}
