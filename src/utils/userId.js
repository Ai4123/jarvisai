/**
 * Utility to get user_id UUID from username/email
 * Since chats.user_id references auth_users.id (UUID), we need to look it up
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Get user_id UUID from users table by email or username
 * Tries public.users first, then falls back to other methods
 * @param {string} email - User's email address
 * @param {string} username - User's username (optional)
 * @returns {Promise<string|null>} - User UUID or null if not found
 */
export async function getUserIdFromEmail(email, username = null) {
  if (!email && !username) return null;

  try {
    // First, try to query public.users table (more accessible than auth.users)
    if (email) {
      const { data: emailData, error: emailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (!emailError && emailData?.id) {
        console.log('✅ Found user_id from public.users by email:', emailData.id);
        return emailData.id;
      }
    }

    // Try RPC function if available
    if (email) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
        user_email: email.toLowerCase()
      });

      if (!rpcError && rpcData) {
        console.log('✅ Found user_id from RPC function:', rpcData);
        return rpcData;
      }
    }

    console.warn('⚠️ Could not find user_id in database for:', email || username);
    return null;
  } catch (err) {
    console.error('❌ Error looking up user_id:', err);
    return null;
  }
}

/**
 * Generate a deterministic UUID from a string (username/email)
 * Creates a valid UUID v4 format deterministically
 * @param {string} input - Username or email
 * @returns {string} - Valid UUID string (deterministic)
 */
export function generateDeterministicId(input) {
  if (!input) return null;

  // Normalize input (lowercase, trim)
  const normalized = input.toLowerCase().trim();
  
  // Create multiple hash values for different parts of UUID
  let hash1 = 0;
  let hash2 = 0;
  let hash3 = 0;
  let hash4 = 0;
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash1 = hash1 & hash1;
    
    hash2 = ((hash2 << 7) - hash2) + char + i;
    hash2 = hash2 & hash2;
    
    hash3 = ((hash3 << 3) - hash3) + char * (i + 1);
    hash3 = hash3 & hash3;
    
    hash4 = ((hash4 << 11) - hash4) + char * (i + 2);
    hash4 = hash4 & hash4;
  }
  
  // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where y is one of 8, 9, a, or b
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(0, 8);
  const part2 = Math.abs(hash2).toString(16).padStart(4, '0').slice(0, 4);
  const part3 = '4' + Math.abs(hash3).toString(16).padStart(3, '0').slice(0, 3);
  const part4 = (['8', '9', 'a', 'b'][Math.abs(hash4) % 4]) + Math.abs(hash1 + hash2).toString(16).padStart(3, '0').slice(0, 3);
  const part5 = (Math.abs(hash1).toString(16) + Math.abs(hash2).toString(16) + Math.abs(hash3).toString(16) + Math.abs(hash4).toString(16)).padStart(12, '0').slice(0, 12);
  
  const uuid = `${part1}-${part2}-${part3}-${part4}-${part5}`;
  
  // Validate UUID format (should be 36 characters: 32 hex + 4 dashes)
  if (uuid.length !== 36) {
    console.error('Generated invalid UUID length:', uuid);
    // Fallback to a simple but valid UUID
    return '00000000-0000-4000-8000-' + Math.abs(hash1).toString(16).padStart(12, '0');
  }
  
  return uuid;
}

/**
 * Verify if a user_id exists in the database
 * @param {string} userId - User UUID to verify
 * @returns {Promise<boolean>} - True if user exists, false otherwise
 */
export async function verifyUserIdExists(userId) {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('⚠️ User ID not found in database:', userId);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Error verifying user_id:', err);
    return false;
  }
}

/**
 * Get or create user_id for chat creation
 * First checks JWT token for user_id and verifies it exists, then tries database lookup
 * @param {Object} user - User object from JWT (contains username, email, user_id, etc.)
 * @returns {Promise<string>} - User UUID that exists in database
 */
export async function getUserIdForChat(user) {
  if (!user) {
    console.error('❌ No user object provided');
    return null;
  }

  // First priority: Check if user_id is already in JWT token (from updated workflow)
  if (user.user_id) {
    console.log('🔍 Found user_id in JWT token:', user.user_id);
    
    // Verify the user_id actually exists in the database
    const exists = await verifyUserIdExists(user.user_id);
    if (exists) {
      console.log('✅ Verified user_id exists in database:', user.user_id);
      return user.user_id;
    } else {
      console.warn('⚠️ user_id from JWT not found in database, will try lookup by email');
    }
  }

  // Second priority: Try to get from database by email or username
  const userId = await getUserIdFromEmail(user.email, user.username);
  if (userId) {
    console.log('✅ Found user_id from database lookup:', userId);
    return userId;
  }

  // If we still don't have a valid user_id, this is an error
  console.error('❌ Could not find user in database. User must be created via login workflow first.');
  console.error('User data:', { email: user.email, username: user.username, user_id: user.user_id });
  
  return null;
}

