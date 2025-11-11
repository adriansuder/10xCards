#!/usr/bin/env node
// Load .env.test into process.env and start the dev server in test mode
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.test');
console.log(`Loading environment from ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn('Could not load .env.test, falling back to existing environment:', result.error.message);
}

// Basic validation to fail fast if required Supabase vars are missing or look invalid
const url = process.env.PUBLIC_SUPABASE_URL;
const anon = process.env.PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url) {
  console.error('Missing PUBLIC_SUPABASE_URL in .env.test or environment. Please set it.');
  process.exit(1);
}

if (!anon && !service) {
  console.error('Missing PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.test or environment. Please set one of them.');
  process.exit(1);
}

if (anon && anon.length < 20) {
  console.warn('PUBLIC_SUPABASE_ANON_KEY looks too short and may be invalid.');
}
if (service && service.length < 20) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY looks too short and may be invalid.');
}

// Use npx to ensure local CLI resolution works across machines
const cmd = 'npx';
const args = ['astro', 'dev', '--mode', 'test'];

const child = spawn(cmd, args, { stdio: 'inherit', env: process.env, shell: true });

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code);
  }
});
