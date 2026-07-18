/**
 * LAYOUT_I18N is only useful if it is COMPLETE — a host binds its missing-key guard to this map,
 * so a key the package resolves but the map omits is invisible to every portal and reaches users
 * as a raw dotted name. This test reads the package source and fails if the two ever drift.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { LAYOUT_I18N } from './constants';

const SRC = join(__dirname);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    const isSource = /\.tsx?$/.test(entry) && !entry.includes('.test.');
    return isSource ? [full] : [];
  });
}

describe('LAYOUT_I18N i18n manifest', () => {
  const files = sourceFiles(SRC).filter((f) => !f.endsWith('constants.ts'));

  it('covers every key the package resolves — no component may use a raw key literal', () => {
    // A raw `t('some.key')` bypasses the manifest, so a host binding its guard to LAYOUT_I18N
    // never learns the key exists. Every call site must go through the map.
    const offenders = files
      .map((file) => ({ file, matches: /\bt\(\s*'/.exec(readFileSync(file, 'utf8')) }))
      .filter((entry) => entry.matches !== null)
      .map((entry) => entry.file);

    expect(offenders).toEqual([]);
  });

  it('has no UNUSED entries — a stale key would make hosts define translations for nothing', () => {
    const sources = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const unused = Object.keys(LAYOUT_I18N).filter(
      (name) => !sources.includes(`LAYOUT_I18N.${name}`),
    );

    expect(unused).toEqual([]);
  });

  it('maps every entry to a non-empty, unique key string', () => {
    const values = Object.values(LAYOUT_I18N);
    values.forEach((value) => { expect(value.length).toBeGreaterThan(0); });
    expect(new Set(values).size).toBe(values.length);
  });
});
