import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { getConfig } from '@nera-static/plugin-utils'

// `nera add canonical-links` copies this file into a site that has none, so
// every active key must be a built-in default: a sample origin would point
// every canonical link at example.com.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shipped = getConfig(path.join(__dirname, '../config/canonical-links.yaml'))

describe('shipped config/canonical-links.yaml', () => {
    it('holds only the built-in defaults as active keys', () => {
        expect(shipped).toEqual({ page_identifier: 'slug' })
    })
})
