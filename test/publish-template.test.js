import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'
import pug from 'pug'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const SCRIPT_PATH = path.resolve('bin/publish-template.js')

let projectRoot
let templatesDest

function publish(args = []) {
    return execFileSync('node', [SCRIPT_PATH, ...args], {
        cwd: projectRoot,
        stdio: 'pipe',
    }).toString()
}

beforeEach(() => {
    projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nera-canonical-pub-'))
    templatesDest = path.join(
        projectRoot,
        'views/vendor/plugin-canonical-links'
    )

    // Minimum shape validateNeraProject() looks for.
    fs.writeFileSync(
        path.join(projectRoot, 'package.json'),
        JSON.stringify({ name: 'my-site' }, null, 2)
    )
    fs.mkdirSync(path.join(projectRoot, 'config'), { recursive: true })
    fs.writeFileSync(path.join(projectRoot, 'config/app.yaml'), 'lang: en\n')
    fs.mkdirSync(path.join(projectRoot, 'pages'), { recursive: true })
})

afterEach(() => {
    fs.rmSync(projectRoot, { recursive: true, force: true })
})

describe('publish-template command', () => {
    it('publishes index.pug together with its partials', () => {
        publish()

        for (const template of [
            'index.pug',
            'partials/canonical-link.pug',
            'partials/alternate-links.pug',
        ]) {
            expect(fs.existsSync(path.join(templatesDest, template))).toBe(true)
        }
    })

    it('publishes templates that actually compile', () => {
        publish()

        // index.pug opens with `include partials/...`, so this only passes
        // if the partials came along.
        expect(() =>
            pug.compileFile(path.join(templatesDest, 'index.pug'))
        ).not.toThrow()
    })

    it('skips if templates directory already exists', () => {
        fs.mkdirSync(templatesDest, { recursive: true })
        fs.writeFileSync(path.join(templatesDest, 'index.pug'), '// mine')

        const output = publish()

        expect(output).toMatch(/Skipping/i)
        expect(fs.readFileSync(path.join(templatesDest, 'index.pug'), 'utf-8')).toBe(
            '// mine'
        )
    })

    it('overwrites an existing directory when --force is passed', () => {
        fs.mkdirSync(templatesDest, { recursive: true })
        fs.writeFileSync(path.join(templatesDest, 'index.pug'), '// stale')

        publish(['--force'])

        expect(
            fs.readFileSync(path.join(templatesDest, 'index.pug'), 'utf-8')
        ).toContain('include partials/canonical-link')
    })
})
