import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { getMetaData } from '../index.js'

// Config is read relative to cwd, so each test runs in a throwaway project
// directory rather than writing into the real repo.
const REPO_ROOT = process.cwd()
let workDir

function writeConfig(content) {
    fs.mkdirSync(path.join(workDir, 'config'), { recursive: true })
    fs.writeFileSync(path.join(workDir, 'config/canonical-links.yaml'), content)
}

function pages() {
    return [
        { content: '<p>en</p>', meta: { href: '/index.html', lang: 'en', slug: 'home' } },
        { content: '<p>es</p>', meta: { href: '/es/index.html', lang: 'es', slug: 'home' } },
    ]
}

beforeEach(() => {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-canonical-'))
    process.chdir(workDir)
})

afterEach(() => {
    process.chdir(REPO_ROOT)
    fs.rmSync(workDir, { recursive: true, force: true })
    vi.restoreAllMocks()
})

describe('getMetaData — origin resolution', () => {
    it('emits no canonical links when no origin is configured anywhere', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const result = getMetaData({ app: {}, pagesData: pages() })

        // The bug this guards: every page used to get
        // href="undefined/index.html".
        for (const page of result) {
            expect(page.meta.canonicalLink).toBeUndefined()
            expect(page.meta.alternateLinks).toBeUndefined()
        }
        expect(JSON.stringify(result)).not.toContain('undefined')
        expect(warn).toHaveBeenCalledOnce()
        expect(warn.mock.calls[0][0]).toMatch(/no origin configured/i)
    })

    it('leaves the pages otherwise untouched when bailing out', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})

        const input = pages()
        const result = getMetaData({ app: {}, pagesData: input })

        expect(result).toEqual(input)
    })

    it('uses app.origin when only that is set', () => {
        const result = getMetaData({
            app: { origin: 'https://from-app.test' },
            pagesData: pages(),
        })

        expect(result[0].meta.canonicalLink).toEqual({
            href: 'https://from-app.test/index.html',
            rel: 'canonical',
        })
    })

    it('uses config.app_origin when only that is set', () => {
        writeConfig('app_origin: https://from-config.test\n')

        const result = getMetaData({ app: {}, pagesData: pages() })

        expect(result[0].meta.canonicalLink.href).toBe(
            'https://from-config.test/index.html'
        )
    })

    it('strips a trailing slash from the origin', () => {
        const result = getMetaData({
            app: { origin: 'https://from-app.test/' },
            pagesData: pages(),
        })

        // Not https://from-app.test//index.html — meta.href already leads
        // with a slash.
        expect(result[0].meta.canonicalLink.href).toBe(
            'https://from-app.test/index.html'
        )
    })

    it('strips a trailing slash from config.app_origin too', () => {
        writeConfig('app_origin: https://from-config.test///\n')

        const result = getMetaData({ app: {}, pagesData: pages() })

        expect(result[0].meta.canonicalLink.href).toBe(
            'https://from-config.test/index.html'
        )
    })

    it('prefers app.origin over config.app_origin when both are set', () => {
        writeConfig('app_origin: https://from-config.test\n')

        const result = getMetaData({
            app: { origin: 'https://from-app.test' },
            pagesData: pages(),
        })

        // Documented backwards in the README until 2.1.0.
        expect(result[0].meta.canonicalLink.href).toBe(
            'https://from-app.test/index.html'
        )
    })
})

describe('getMetaData — alternates', () => {
    it('links translations that share a page_identifier', () => {
        writeConfig(`
app_origin: https://example.test
page_identifier: slug
available_languages:
  - en
  - es
`)

        const result = getMetaData({ app: {}, pagesData: pages() })

        expect(result[0].meta.alternateLinks).toEqual([
            {
                href: 'https://example.test/es/index.html',
                hreflang: 'es',
                rel: 'alternate',
            },
        ])
    })

    it('emits no alternates when available_languages is absent', () => {
        writeConfig('app_origin: https://example.test\n')

        const result = getMetaData({ app: {}, pagesData: pages() })

        // Silent by design — documented in the README as of 2.1.0.
        expect(result[0].meta.alternateLinks).toEqual([])
        expect(result[0].meta.canonicalLink).toBeDefined()
    })

    it('honours a custom page_identifier', () => {
        writeConfig(`
app_origin: https://example.test
page_identifier: translationKey
available_languages:
  - en
  - de
`)

        const pagesData = [
            {
                content: '',
                meta: { href: '/a.html', lang: 'en', translationKey: 'k' },
            },
            {
                content: '',
                meta: { href: '/de/a.html', lang: 'de', translationKey: 'k' },
            },
        ]

        const result = getMetaData({ app: {}, pagesData })

        expect(result[0].meta.alternateLinks).toHaveLength(1)
        expect(result[0].meta.alternateLinks[0].hreflang).toBe('de')
    })

    it('does not treat two pages that both lack the identifier as translations', () => {
        writeConfig(`
app_origin: https://example.test
available_languages:
  - en
  - es
`)

        // Neither page has a slug. Before 2.2.1 the find() compared
        // `undefined === undefined`, so these unrelated pages were cross-linked
        // with hreflang — the live symptom was every generated tag-overview
        // page pointing at the same unrelated page in each other language.
        const pagesData = [
            { content: '', meta: { href: '/about.html', lang: 'en' } },
            { content: '', meta: { href: '/es/contacto.html', lang: 'es' } },
        ]

        const result = getMetaData({ app: {}, pagesData })

        expect(result[0].meta.alternateLinks).toEqual([])
        expect(result[1].meta.alternateLinks).toEqual([])
        // The canonical link itself is unaffected — it needs no identifier.
        expect(result[0].meta.canonicalLink.href).toBe(
            'https://example.test/about.html'
        )
    })

    it('ignores candidate pages that lack the identifier', () => {
        writeConfig(`
app_origin: https://example.test
available_languages:
  - en
  - es
`)

        const pagesData = [
            { content: '', meta: { href: '/a.html', lang: 'en', slug: 'a' } },
            { content: '', meta: { href: '/es/noslug.html', lang: 'es' } },
        ]

        const result = getMetaData({ app: {}, pagesData })

        expect(result[0].meta.alternateLinks).toEqual([])
    })

    it('emits no alternates for a page with no lang', () => {
        writeConfig(`
app_origin: https://example.test
available_languages:
  - en
  - es
`)

        const result = getMetaData({
            app: {},
            pagesData: [{ content: '', meta: { href: '/x.html', slug: 'x' } }],
        })

        expect(result[0].meta.alternateLinks).toEqual([])
    })
})
