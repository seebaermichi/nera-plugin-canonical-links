const { getConfig } = require('../plugin-helper')

module.exports = (() => {
    const config = getConfig(`${__dirname}/config/multi-lang-canonical.yaml`)
    const availableLanguages = config.available_languages
    const pageIdentifier = config.page_identifier || 'slug'

    const getOrigin = data => data.app.origin || config.app_origin

    const getCanonical = (meta, data) => {
        return {
            href: `${getOrigin(data)}${meta.href}`,
            rel: 'canonical'
        }
    }

    const getAlternates = (pageMeta, data) => {
        const multiLangCanonicals = []
        const REL = 'alternate'

        availableLanguages.forEach(availableLang => {
            if (pageMeta.lang && availableLang !== pageMeta.lang) {
                const relCanonical = data.pagesData
                    .find(({ meta }) => meta.lang === availableLang && meta[pageIdentifier] === pageMeta[pageIdentifier])

                multiLangCanonicals.push({
                    href: `${getOrigin(data)}${relCanonical.meta.href}`,
                    hreflang: availableLang,
                    rel: REL
                })
            }
        })

        return multiLangCanonicals
    }

    const getMetaData = data => {
        data.pagesData = data.pagesData.map(({ content, meta }) => {
            return {
                content,
                meta: Object.assign({}, meta, {
                    canonicalLink: getCanonical(meta, data),
                    alternateLinks: getAlternates(meta, data)
                })
            }
        })

        return data.pagesData
    }

    return {
        getMetaData
    }
})()
