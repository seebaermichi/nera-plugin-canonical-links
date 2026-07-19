#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'
import { publishAllTemplates } from '@nera-static/plugin-utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginName = 'plugin-canonical-links'
const sourceDir = path.resolve(__dirname, '../views/')
const force = process.argv.includes('--force')

const result = publishAllTemplates({
    pluginName,
    sourceDir,
    force,
})

process.exit(result ? 0 : 1)
