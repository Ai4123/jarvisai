/**
 * Quick script to check Supabase schema via REST API
 * Run with: node scripts/check-schema.mjs
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zdfenmxhwpdswwpjbcmq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not found in environment');
  console.log('Please create a .env file with VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase schema...\n');

  // Try to query chats table structure by attempting different inserts
  console.log('📊 Checking chats table structure...\n');

  // Check if there's a users table
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (!usersError && usersData !== null) {
      console.log('✅ Found users table');
      if (usersData.length > 0) {
        console.log('   Sample user:', Object.keys(usersData[0]));
      }
    } else {
      console.log('ℹ️  No users table found (or access denied)');
    }
  } catch (e) {
    console.log('ℹ️  No users table found');
  }

  // Try to get existing chats to understand structure
  try {
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);

    if (chatsError) {
      console.log('❌ Error querying chats:', chatsError.message);
    } else if (chatsData && chatsData.length > 0) {
      console.log('✅ Found existing chats');
      console.log('   Sample chat structure:', JSON.stringify(chatsData[0], null, 2));
      console.log('\n   Columns:', Object.keys(chatsData[0]));
      console.log('   user_id type:', typeof chatsData[0].user_id);
      console.log('   user_id value:', chatsData[0].user_id);
      console.log('   user_id length:', chatsData[0].user_id?.length);
      
      // Check if user_id looks like UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (chatsData[0].user_id && uuidRegex.test(chatsData[0].user_id)) {
        console.log('   ✅ user_id is a UUID');
      } else {
        console.log('   ⚠️  user_id is NOT a UUID (might be text/username)');
      }
    } else {
      console.log('ℹ️  No existing chats found');
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  console.log('\n💡 Based on the error message, user_id expects a UUID.');
  console.log('   The database schema likely has user_id as UUID type.');
  console.log('   But the code is trying to insert username (string) like "ash".\n');
}

checkSchema();

