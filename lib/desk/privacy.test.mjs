import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const source = path => readFileSync(new URL('../../'+path, import.meta.url), 'utf8')

test('public navigation does not advertise the private workspace', () => {
  assert.doesNotMatch(source('components/Nav.tsx'), /\/desk|\/dashboard/)
})

test('private page entries reject signed-out visits before rendering', () => {
  for (const path of ['app/desk/page.tsx','app/desk/x/page.tsx','app/desk/replies/page.tsx','app/dashboard/page.tsx']) {
    assert.match(source(path), /if \(!\(await isDesk\(\)\)\) notFound\(\)/)
  }
  assert.match(source('app/desk/app/route.ts'), /if \(!\(await isDesk\(\)\)\).*status: 404/)
})
