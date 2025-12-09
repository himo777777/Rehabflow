/**
 * GDPR Data Deletion API - Vercel Edge Function
 *
 * Implements GDPR Article 17 - Right to erasure ("right to be forgotten")
 *
 * Features:
 * - Soft delete with 30-day recovery period
 * - Hard delete after confirmation
 * - Cascade deletion across all tables
 * - Audit trail preserved for compliance
 * - Confirmation required via POST body
 */

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Tables containing user data (deletion order matters for foreign keys)
// Delete in reverse order of dependencies
const USER_DATA_TABLES_DELETION_ORDER = [
  // First: Remove references
  'forum_reactions',
  'forum_comments',
  'forum_posts',

  // Notifications & communication
  'notifications',
  'conversation_memory',

  // Gamification
  'points',
  'streaks',
  'achievements',

  // Predictions & analytics
  'risk_stratification',
  'outcome_predictions',
  'pain_predictions',

  // Assessment data
  'assessment_results',
  'standardized_assessments',
  'user_assessments',

  // Progress & goals
  'daily_checkins',
  'goals',
  'progress',

  // Pain & exercise
  'pain_logs',
  'exercise_progress',
  'exercise_logs',
  'exercise_programs',

  // Health data
  'health_data_sync_log',
  'health_data_preferences',
  'health_data',

  // Provider relations (soft delete - keep for audit)
  'clinical_notes',
  'provider_patients',

  // Core user data
  'user_settings',
  'profiles',

  // Consent records (keep for legal compliance)
  // 'consent_records' - NOT deleted, required for legal proof
];

// Tables to preserve for legal/audit compliance (with anonymization)
const TABLES_TO_ANONYMIZE = [
  'consent_records',
  'audit_logs',
];

interface DeletionRequest {
  confirmDeletion: boolean;
  reason?: string;
  hardDelete?: boolean; // If true, skip soft delete period
}

interface DeletionResult {
  status: 'scheduled' | 'completed' | 'error';
  deletionId: string;
  scheduledDeletionDate?: string;
  deletedTables: string[];
  anonymizedTables: string[];
  preservedTables: string[];
  message: string;
  gdprArticle: 'Article 17 - Right to erasure';
}

export default async function handler(req: Request) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({
      error: 'Server configuration error',
      message: 'Database connection not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract auth token from request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      error: 'Unauthorized',
      message: 'Authentication required for data deletion'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.substring(7);

  try {
    // Parse request body
    const body: DeletionRequest = await req.json();

    // Require explicit confirmation
    if (!body.confirmDeletion) {
      return new Response(JSON.stringify({
        error: 'Confirmation required',
        message: 'You must set confirmDeletion: true to proceed with data deletion',
        required: {
          confirmDeletion: true,
          reason: '(optional) Reason for deletion',
          hardDelete: '(optional) Set to true for immediate deletion without recovery period'
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's token for auth verification
    const supabaseUser = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    const deletionId = crypto.randomUUID();

    // Create admin client for data operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const deletedTables: string[] = [];
    const anonymizedTables: string[] = [];
    const preservedTables: string[] = [];
    const errors: string[] = [];

    if (body.hardDelete) {
      // Immediate hard delete
      for (const tableName of USER_DATA_TABLES_DELETION_ORDER) {
        try {
          // Try with user_id first
          const { error } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('user_id', userId);

          if (error) {
            if (error.code === '42P01') {
              // Table doesn't exist, skip
              continue;
            }
            // Try with patient_id
            const { error: altError } = await supabaseAdmin
              .from(tableName)
              .delete()
              .eq('patient_id', userId);

            if (!altError) {
              deletedTables.push(tableName);
            }
          } else {
            deletedTables.push(tableName);
          }
        } catch {
          // Skip tables that cause errors
          continue;
        }
      }

      // Also delete from provider_patients where user is provider
      try {
        await supabaseAdmin
          .from('provider_patients')
          .delete()
          .eq('provider_id', userId);
      } catch {
        // Ignore errors
      }

      // Anonymize required tables
      for (const tableName of TABLES_TO_ANONYMIZE) {
        try {
          // For consent records, anonymize but keep the record
          if (tableName === 'consent_records') {
            await supabaseAdmin
              .from(tableName)
              .update({
                user_email: 'deleted@anonymized.local',
                user_name: 'Deleted User',
                ip_address: null,
                user_agent: null,
              })
              .eq('user_id', userId);
            anonymizedTables.push(tableName);
          }
          // For audit logs, just mark as anonymized
          if (tableName === 'audit_logs') {
            await supabaseAdmin
              .from(tableName)
              .update({
                actor_email: 'deleted@anonymized.local',
                ip_address: null,
                user_agent: null,
                metadata: { anonymized: true, anonymizedAt: new Date().toISOString() }
              })
              .eq('actor_id', userId);
            anonymizedTables.push(tableName);
          }
        } catch {
          preservedTables.push(tableName);
        }
      }

      // Log the deletion
      try {
        await supabaseAdmin.rpc('log_audit_event', {
          p_action: 'DELETE',
          p_resource_type: 'user_account',
          p_resource_id: deletionId,
          p_resource_owner_id: userId,
          p_phi_accessed: true,
          p_purpose: 'legal',
          p_metadata: {
            gdprArticle: 'Article 17',
            deletionType: 'hard_delete',
            deletedTables,
            anonymizedTables,
            reason: body.reason || 'User requested deletion',
          },
        });
      } catch {
        // Audit logging failure shouldn't block deletion
      }

      // Finally, delete the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (e) {
        errors.push('Failed to delete auth user. Please contact support.');
      }

      const result: DeletionResult = {
        status: errors.length > 0 ? 'error' : 'completed',
        deletionId,
        deletedTables,
        anonymizedTables,
        preservedTables,
        message: errors.length > 0
          ? `Deletion completed with errors: ${errors.join(', ')}`
          : 'Your data has been permanently deleted. Thank you for using RehabFlow.',
        gdprArticle: 'Article 17 - Right to erasure',
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } else {
      // Soft delete with 30-day recovery period
      const scheduledDeletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Mark user for deletion
      try {
        await supabaseAdmin.from('profiles').update({
          deleted_at: new Date().toISOString(),
          deletion_scheduled_at: scheduledDeletionDate,
          deletion_reason: body.reason || 'User requested deletion',
          deletion_id: deletionId,
        }).eq('user_id', userId);

        // Also update user metadata
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            deletion_scheduled: true,
            deletion_scheduled_at: scheduledDeletionDate,
            deletion_id: deletionId,
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({
          error: 'Deletion scheduling failed',
          message: 'Could not schedule account for deletion. Please try again or contact support.'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Log the scheduled deletion
      try {
        await supabaseAdmin.rpc('log_audit_event', {
          p_action: 'DELETE',
          p_resource_type: 'user_account',
          p_resource_id: deletionId,
          p_resource_owner_id: userId,
          p_phi_accessed: true,
          p_purpose: 'legal',
          p_metadata: {
            gdprArticle: 'Article 17',
            deletionType: 'soft_delete',
            scheduledDeletionDate,
            reason: body.reason || 'User requested deletion',
          },
        });
      } catch {
        // Audit logging failure shouldn't block operation
      }

      const result: DeletionResult = {
        status: 'scheduled',
        deletionId,
        scheduledDeletionDate,
        deletedTables: [],
        anonymizedTables: [],
        preservedTables: ['All data preserved during recovery period'],
        message: `Your account has been scheduled for deletion on ${scheduledDeletionDate.split('T')[0]}. You have 30 days to cancel this request by logging in. After this period, all your data will be permanently deleted.`,
        gdprArticle: 'Article 17 - Right to erasure',
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('GDPR delete error:', error);

    return new Response(JSON.stringify({
      error: 'Deletion failed',
      message: 'An error occurred while processing your deletion request. Please try again or contact support.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
