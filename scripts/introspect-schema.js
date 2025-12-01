/**
 * Script to introspect Supabase database schema
 * This uses the Supabase REST API to get table information
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zdfenmxhwpdswwpjbcmq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in environment variables');
  console.log('Please set VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function introspectSchema() {
  console.log('🔍 Introspecting Supabase database schema...\n');

  try {
    // Query information_schema to get table structures
    // Note: This requires direct database access, so we'll use a different approach
    
    // Instead, let's query each table to understand its structure
    const tables = ['chats', 'messages', 'tickets', 'feedback', 'survey_responses', 'documents'];
    
    const schema = {
      tables: {}
    };

    for (const tableName of tables) {
      try {
        // Try to get a sample row to understand the structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`⚠️  Table "${tableName}": ${error.message}`);
          schema.tables[tableName] = { error: error.message };
        } else {
          // Infer schema from sample data
          if (data && data.length > 0) {
            const sampleRow = data[0];
            const columns = {};
            for (const [key, value] of Object.entries(sampleRow)) {
              columns[key] = {
                type: typeof value === 'string' ? 'string' : 
                      typeof value === 'number' ? 'number' :
                      typeof value === 'boolean' ? 'boolean' :
                      Array.isArray(value) ? 'array' : 'object',
                sampleValue: value
              };
            }
            schema.tables[tableName] = { columns };
            console.log(`✅ Table "${tableName}": Found ${Object.keys(columns).length} columns`);
          } else {
            console.log(`ℹ️  Table "${tableName}": Empty table`);
            schema.tables[tableName] = { columns: {}, note: 'Empty table' };
          }
        }
      } catch (err) {
        console.error(`❌ Error querying table "${tableName}":`, err.message);
        schema.tables[tableName] = { error: err.message };
      }
    }

    // Save schema to file
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    console.log(`\n✅ Schema saved to: ${schemaPath}`);

    // Also create a Prisma schema based on findings
    generatePrismaSchema(schema);

  } catch (error) {
    console.error('❌ Error during introspection:', error);
    process.exit(1);
  }
}

function generatePrismaSchema(schema) {
  let prismaSchema = `// Auto-generated Prisma schema from Supabase introspection
// Generated at: ${new Date().toISOString()}

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

  for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
    if (tableInfo.error) continue;

    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    prismaSchema += `model ${modelName} {\n`;
    
    if (tableInfo.columns) {
      for (const [columnName, columnInfo] of Object.entries(tableInfo.columns)) {
        // Infer Prisma type from sample value
        let prismaType = 'String';
        if (columnInfo.type === 'number') {
          // Check if it's likely an integer or float
          const sample = columnInfo.sampleValue;
          if (Number.isInteger(sample)) {
            prismaType = 'Int';
          } else {
            prismaType = 'Float';
          }
        } else if (columnInfo.type === 'boolean') {
          prismaType = 'Boolean';
        } else if (columnInfo.type === 'array') {
          prismaType = 'Json';
        } else if (columnInfo.type === 'object') {
          prismaType = 'Json';
        }
        
        // Check if it's likely an ID field
        if (columnName === 'id' || columnName.endsWith('_id')) {
          if (prismaType === 'String' && columnInfo.sampleValue && typeof columnInfo.sampleValue === 'string' && columnInfo.sampleValue.length === 36) {
            prismaType = 'String @id @default(uuid())';
          } else if (prismaType === 'Int') {
            prismaType = 'Int @id @default(autoincrement())';
          }
        }
        
        prismaSchema += `  ${columnName} ${prismaType}\n`;
      }
    }
    
    prismaSchema += `}\n\n`;
  }

  const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  fs.writeFileSync(prismaSchemaPath, prismaSchema);
  console.log(`✅ Prisma schema generated: ${prismaSchemaPath}`);
  console.log('\n⚠️  Note: This is an inferred schema. Please review and adjust types as needed.');
  console.log('   Especially check UUID fields, timestamps, and relationships.\n');
}

// Run introspection
introspectSchema();

