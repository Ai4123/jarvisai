/**
 * Setup script to introspect Supabase database with Prisma
 * Run: node scripts/setup-prisma.js
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Setting up Prisma to introspect Supabase database...\n');

// Check if .env exists
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('📝 Please create a .env file with your DATABASE_URL');
  console.log('   You can copy .env.example and fill in your connection string\n');
  process.exit(1);
}

// Read .env to check if DATABASE_URL is set
const envContent = fs.readFileSync(envPath, 'utf-8');
if (!envContent.includes('DATABASE_URL=') || envContent.includes('DATABASE_URL=""') || envContent.includes('DATABASE_URL=[YOUR')) {
  console.error('❌ DATABASE_URL not set in .env file!');
  console.log('📝 Please add your Supabase database connection string to .env');
  console.log('   Format: DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"\n');
  process.exit(1);
}

console.log('✅ .env file found with DATABASE_URL\n');
console.log('🔄 Introspecting database schema...\n');

try {
  // Run prisma db pull to introspect
  execSync('npx prisma db pull', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('\n✅ Database schema introspected successfully!');
  console.log('📄 Schema saved to: prisma/schema.prisma\n');

  console.log('🔄 Generating Prisma Client...\n');
  
  // Generate Prisma client
  execSync('npx prisma generate', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('\n✅ Prisma Client generated successfully!');
  console.log('📦 Client available at: node_modules/.prisma/client\n');
  console.log('💡 You can now use Prisma Client in your code:');
  console.log('   import { PrismaClient } from "@prisma/client"');
  console.log('   const prisma = new PrismaClient()\n');

} catch (error) {
  console.error('\n❌ Error during introspection:', error.message);
  process.exit(1);
}

