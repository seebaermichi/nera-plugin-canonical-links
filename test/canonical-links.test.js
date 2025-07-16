import { describe, it, expect } from 'vitest'
import path from 'path'
import pug from 'pug'
import { load } from 'cheerio'

const VIEWS_DIR = path.join(process.cwd(), 'views')

describe('Canonical links view rendering', () => {
    it('renders canonical and alternate link tags correctly', () => {
        const html = pug.renderFile(path.join(VIEWS_DIR, 'index.pug'), {
            meta: {
                canonicalLink: {
                    href: 'https://example.com/index.html',
                    rel: 'canonical',
                },
                alternateLinks: [
                    {
                        href: 'https://example.com/es/index.html',
                        hreflang: 'es',
                        rel: 'alternate',
                    },
                    {
                        href: 'https://example.com/fr/index.html',
                        hreflang: 'fr',
                        rel: 'alternate',
                    },
                ],
            },
        })

        const $ = load(html)

        // Check canonical link
        const canonical = $('link[rel="canonical"]')
        expect(canonical).toHaveLength(1)
        expect(canonical.attr('href')).toBe('https://example.com/index.html')

        // Check alternate links
        const alternates = $('link[rel="alternate"]')
        expect(alternates).toHaveLength(2)
        expect(alternates.eq(0).attr('hreflang')).toBe('es')
        expect(alternates.eq(0).attr('href')).toBe(
            'https://example.com/es/index.html'
        )
        expect(alternates.eq(1).attr('hreflang')).toBe('fr')
        expect(alternates.eq(1).attr('href')).toBe(
            'https://example.com/fr/index.html'
        )
    })

    it('renders nothing if no meta links are defined', () => {
        const html = pug.renderFile(path.join(VIEWS_DIR, 'index.pug'), {
            meta: {},
        })

        const $ = load(html)
        expect($('link').length).toBe(0)
    })
})
