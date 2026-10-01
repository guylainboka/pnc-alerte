#!/usr/bin/env node
/**
 * Applique un fichier SQL au projet Supabase via la Management API.
 * Usage: node scripts/apply-supabase-migration.mjs <sql-file.sql>
 */
import { readFileSync } from 'node:fs';
import { argv, env, exit } from 'node:process';

// Load .env.local manually (the script runs outside Next.js)
try {
  const envLocal = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of envLocal.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
} catch {
  /* ignore */
}

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.SUPABASE_PROJECT_REF;

if (!token || !ref) {
  console.error('❌ SUPABASE_ACCESS_TOKEN ou SUPABASE_PROJECT_REF manquant dans .env.local');
  exit(1);
}

const file = argv[2];
if (!file) {
  console.error('Usage: node scripts/apply-supabase-migration.mjs <sql-file.sql>');
  exit(1);
}

const sql = readFileSync(file, 'utf8');
console.log(`📄 Application de ${file} (${sql.length} octets) au projet ${ref}...`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`❌ Erreur HTTP ${res.status}:`);
  console.error(text);
  exit(1);
}

try {
  const json = JSON.parse(text);
  console.log('✅ Migration appliquée avec succès.');
  if (Array.isArray(json) && json.length) {
    console.log(`   → ${json.length} ligne(s) retournée(s).`);
  } else {
    console.log('   → Aucune ligne retournée (DDL réussi).');
  }
} catch {
  console.log('✅ Migration appliquée (réponse non-JSON).');
}
