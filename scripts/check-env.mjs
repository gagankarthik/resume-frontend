/**
 * Report which runtime variables the build can see.
 *
 * Amplify exposes console variables to the build shell, so a name missing here
 * is a name missing in the console. The app is written to degrade rather than
 * crash — no Cognito means no sign-in, no match URL means the match routes
 * answer 503 — which is exactly the kind of failure that ships unnoticed. So
 * the build says it out loud.
 *
 * Warns by default. Set STRICT_ENV=true to fail the build instead.
 */

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

import { existsSync } from 'node:fs';

let missingAny = false;

console.log('\nEnvironment check');
if (existsSync('.env.local')) {
  console.log('  note    .env.local is present — Next loads it, this check reads only the shell.');
}
for (const group of GROUPS) {
  const missing = group.vars.filter(v => !process.env[v]);
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
  console.log('  variables), then redeploy. None of them may use the NEXT_PUBLIC_ prefix.\n');
  if (process.env.STRICT_ENV === 'true') {
    console.error('STRICT_ENV=true and variables are missing — failing the build.');
    process.exit(1);
  }
} else {
  console.log('  All runtime variables present.\n');
}
