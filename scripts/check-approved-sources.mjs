import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const approvedSources = [
  ['CareerScope-v12.md', '35e9a728a65b0620cb9075345216c69c973fee57efad21752554dc338a532167'],
  [
    'CareerScope-Engineering-Standards.md',
    'c860202371bcdad55258d39a3f5e474355fc013462a9e97ce4ab046e5a034a76',
  ],
  ['CareerScope-Goal.md', '11e61b5b28d2e5bfc736ebfa9e0272b7ee5f2996233db0ea75bdc1ae06daf9c9'],
  [
    'source-revisions/2026-10-20/CareerScope-v12.md',
    'ecb3a40ac0e8bc532baff6e6897d9c4fe962c9b25516b65449814b83b2a25214',
  ],
  [
    'source-revisions/2026-10-20/CareerScope-Engineering-Standards.md',
    '52f78f94123091dfad411d9dd0662635834dbbf381561afe937adbc72eabd25f',
  ],
  [
    'source-revisions/2026-10-20/CareerScope-Goal.md',
    'aa0ea656b12fa62da2aa64ac5d5a455542b964a56bfda0b055133e1eaca69112',
  ],
];

/** Never print source contents; source integrity is separate from implementation readiness. */
export function checkApprovedSources(read) {
  const failures = [];
  for (const [name, expected] of approvedSources) {
    try {
      const actual = createHash('sha256').update(read(name)).digest('hex');
      if (actual !== expected) failures.push(`${name}: approved snapshot changed`);
    } catch {
      failures.push(`${name}: approved snapshot unavailable`);
    }
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = checkApprovedSources((name) =>
    readFileSync(new URL(`../docs/requirements/${name}`, import.meta.url)),
  );
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else
    process.stdout.write(`PASS ${approvedSources.length} approved source snapshots unchanged\n`);
}
