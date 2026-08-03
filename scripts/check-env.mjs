/**
 * Report which runtime variables production will actually see.
 *
 * The distinction this script exists to catch: on Amplify, a variable set in
 * the console is present in the build shell but absent from the compute
 * function that serves traffic. Checking `process.env` during the build
 * therefore proves nothing about runtime — it was green while production ran
 * with no sign-in and answered 503 on every upload.
 *
 * So pass the env file the build writes for the runtime:
 *
 *   node scripts/check-env.mjs .env.production
 *
 * and the check reads that file instead. With no argument it falls back to the
 * build shell, which is the right source locally, where Next loads .env.local
 * itself.
 *
 * The app is written to degrade rather than crash — no Cognito means no
 * sign-in, no extraction URL means uploads answer 503 — which is exactly the
 * kind of failure that ships unnoticed. So the build says it out loud.
 *
 * Warns by default. Set STRICT_ENV=true to fail the build instead.
 */

import { existsSync, readFileSync } from 'node:fs';

const GROUPS = [
  {
    name: 'Sign-in (Cognito)',
    consequence: 'the app runs open — anyone with the link can use it',
    vars: ['NEXT_COGNITO_DOMAIN', 'NEXT_COGNITO_USER_POOL_ID', 'NEXT_COGNITO_CLIENT_ID'],
  },
  {
    name: 'Extraction engine',
    consequence: 'uploads answer 503',
    vars: ['NEXT_EXTRACTION_API_URL'],
  },
  {
    name: 'Matching engine',
    consequence: 'matching answers 503',
    vars: ['NEXT_RESUME_MATCH_API_URL', 'NEXT_RESUME_MATCH_API_KEY'],
  },
  {
    name: 'Origin',
    consequence: 'OAuth redirects are built from the host header instead of the custom domain',
    vars: ['NEXT_APP_ORIGIN'],
  },
];

/** Read `KEY=value` lines. Deliberately minimal — it only has to see names. */
function readEnvFile(path) {
  const found = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (match && match[2].trim() !== '') found[match[1]] = match[2].trim();
  }
  return found;
}

const file = process.argv[2];
let source;
let label;

if (file) {
  if (!existsSync(file)) {
    console.log(`\nEnvironment check\n  MISSING ${file} was never written.`);
    console.log('          Every server route will run unconfigured: no sign-in,');
    console.log('          503 on upload and on matching.\n');
    process.exit(process.env.STRICT_ENV === 'true' ? 1 : 0);
  }
  source = readEnvFile(file);
  label = `${file} — this is what the running server will see`;
} else {
  source = process.env;
  label = 'build shell (local run; on Amplify pass .env.production instead)';
}

console.log('\nEnvironment check');
console.log(`  source  ${label}`);
if (!file && existsSync('.env.local')) {
  console.log('  note    .env.local is present — Next loads it, this check reads only the shell.');
}

let missingAny = false;
for (const group of GROUPS) {
  const missing = group.vars.filter(v => !source[v]);
  if (missing.length === 0) {
    console.log(`  ok      ${group.name}`);
    continue;
  }
  missingAny = true;
  console.log(`  MISSING ${group.name}: ${missing.join(', ')}`);
  console.log(`          Without it, ${group.consequence}.`);
}

if (missingAny) {
  console.log('\n  Set these in the hosting console (Amplify: App settings > Environment');
  console.log('  variables), then redeploy. None of them may use the NEXT_PUBLIC_ prefix.');
  console.log('  If they are already set there and still missing above, the build is not');
  console.log('  copying them into .env.production — see the build phase in amplify.yml.\n');
  if (process.env.STRICT_ENV === 'true') {
    console.error('STRICT_ENV=true and variables are missing — failing the build.');
    process.exit(1);
  }
} else {
  console.log('  All runtime variables present.\n');
}
