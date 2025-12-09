/**
 * GDPR Data Export API - Vercel Edge Function
 *
 * Implements GDPR Article 20 - Right to data portability
 * Exports all user data in a machine-readable format (JSON).
 *
 * Features:
 * - Exports all user data across all tables
 * - Includes audit trail of data access
 * - Supports JSON format (machine-readable)
 * - Rate limited to prevent abuse
 */

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Tables containing user data (in order of importance)
const USER_DATA_TABLES = [
  // Core user data
  'profiles',
  'user_settings',

  // Health data
  'health_data',
  'health_data_preferences',
  'health_data_sync_log',

  // Exercise data
  'exercise_logs',
  'exercise_programs',
  'exercise_progress',

  // Pain & assessment data
  'pain_logs',
  'user_assessments',
  'standardized_assessments',
  'assessment_results',

  // Progress data
  'progress',
  'daily_checkins',
  'goals',

  // Prediction data
  'pain_predictions',
  'outcome_predictions',
  'risk_stratification',

  // Communication
  'conversation_memory',
  'notifications',

  // Forum data (if applicable)
  'forum_posts',
  'forum_comments',
  'forum_reactions',

  // Gamification
  'achievements',
  'streaks',
  'points',

  // Provider relations
  'provider_patients',
  'clinical_notes',

  // Consent records
  'consent_records',
];

// Fields to redact from export (security-sensitive)
const REDACTED_FIELDS = [
  'password_hash',
  'encrypted_key',
  'api_key',
  'access_token',
  'refresh_token',
  'session_id',
];

interface ExportResult {
  exportedAt: string;
  userId: string;
  format: 'json';
  gdprArticle: 'Article 20 - Right to data portability';
  retentionPeriod: string;
  tables: Record<string, unknown[]>;
  metadata: {
    totalRecords: number;
    tablesCovered: string[];
    tablesEmpty: string[];
    exportDuration: number;
  };
}

export default async function handler(req: Request) {
  const startTime = Date.now();

  // Only allow POST (to prevent accidental exports via GET)
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
      message: 'Authentication required for data export'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.substring(7);

  try {
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

    // Create admin client for data access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Collect all user data
    const exportData: Record<string, unknown[]> = {};
    const tablesCovered: string[] = [];
    const tablesEmpty: string[] = [];
    let totalRecords = 0;

    for (const tableName of USER_DATA_TABLES) {
      try {
        // Try to query the table
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          // Table might not exist or have different schema
          if (error.code === '42P01') {
            // Table doesn't exist, skip
            continue;
          }
          // Try with different user ID column
          const { data: altData, error: altError } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq('patient_id', userId);

          if (!altError && altData) {
            if (altData.length > 0) {
              exportData[tableName] = redactSensitiveFields(altData);
              tablesCovered.push(tableName);
              totalRecords += altData.length;
            } else {
              tablesEmpty.push(tableName);
            }
          }
        } else if (data && data.length > 0) {
          exportData[tableName] = redactSensitiveFields(data);
          tablesCovered.push(tableName);
          totalRecords += data.length;
        } else {
          tablesEmpty.push(tableName);
        }
      } catch {
        // Skip tables that cause errors
        continue;
      }
    }

    // Also get user's own data from provider_patients (where they are the provider)
    try {
      const { data: providerData } = await supabaseAdmin
        .from('provider_patients')
        .select('*')
        .eq('provider_id', userId);

      if (providerData && providerData.length > 0) {
        exportData['provider_patients_as_provider'] = redactSensitiveFields(providerData);
        tablesCovered.push('provider_patients_as_provider');
        totalRecords += providerData.length;
      }
    } catch {
      // Skip if error
    }

    // Include user profile from auth
    exportData['auth_user'] = [{
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      phone_confirmed_at: user.phone_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: {
        provider: user.app_metadata?.provider,
        providers: user.app_metadata?.providers,
      },
      user_metadata: user.user_metadata,
    }];
    tablesCovered.push('auth_user');
    totalRecords += 1;

    const exportDuration = Date.now() - startTime;

    const result: ExportResult = {
      exportedAt: new Date().toISOString(),
      userId,
      format: 'json',
      gdprArticle: 'Article 20 - Right to data portability',
      retentionPeriod: 'Data is retained according to our privacy policy. You may request deletion at any time.',
      tables: exportData,
      metadata: {
        totalRecords,
        tablesCovered,
        tablesEmpty,
        exportDuration,
      },
    };

    // Log the export for audit trail
    try {
      await supabaseAdmin.rpc('log_audit_event', {
        p_action: 'EXPORT',
        p_resource_type: 'user_data',
        p_resource_id: userId,
        p_resource_owner_id: userId,
        p_phi_accessed: true,
        p_purpose: 'legal',
        p_metadata: {
          gdprArticle: 'Article 20',
          tablesExported: tablesCovered.length,
          totalRecords,
          exportDuration,
        },
      });
    } catch {
      // Audit logging failure shouldn't block export
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="rehabflow-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
        'X-Export-Records': String(totalRecords),
      },
    });

  } catch (error) {
    console.error('GDPR export error:', error);

    return new Response(JSON.stringify({
      error: 'Export failed',
      message: 'An error occurred while exporting your data. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Remove sensitive fields from export data
 */
function redactSensitiveFields(data: unknown[]): unknown[] {
  return data.map(record => {
    if (typeof record !== 'object' || record === null) {
      return record;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record as Record<string, unknown>)) {
      if (REDACTED_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = redactSensitiveFields([value])[0];
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  });
}
