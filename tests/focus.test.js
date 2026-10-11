import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = ['base.css', 'sections.css']
  .map((n) => readFileSync(new URL(`../assets/css/${n}`, import.meta.url), 'utf8'))
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');

// Находит правило, у которого в списке селекторов есть `<scope> :focus-visible`, и возвращает его тело.
function focusRuleBody(scope) {
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map((s) => s.trim());
    if (selectors.includes(`${scope} :focus-visible`)) return m[2];
  }
  return null;
}

test('the focus ring is darkened on light sections, white demo cards and the terms card', () => {
  for (const scope of ['.section--light', '.demo-card', '.terms']) {
    const body = focusRuleBody(scope);
    assert.ok(body, `${scope} :focus-visible rule exists`);
    assert.ok(body.includes('outline-color: var(--c-green-2)'), `${scope} uses the dark green ring`);
  }
});

test('the default focus ring stays mint for the dark sections', () => {
  const base = css.match(/:focus-visible\s*\{([^}]*)\}/)[1];
  assert.ok(base.includes('var(--c-accent)'));
});
