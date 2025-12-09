/**
 * Audit Service - HIPAA/GDPR Compliant Audit Logging
 *
 * Provides comprehensive audit trail for all data access and modifications.
 * Critical for healthcare compliance and security monitoring.
 */

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export type AuditAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'CONSENT'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLE'
  | 'MFA_DISABLE'
  | 'ADMIN_ACTION'
  | 'SHARE'
  | 'REVOKE_ACCESS';

export type AuditCategory = 'auth' | 'data' | 'admin' | 'system';

export type AuditPurpose =
  | 'treatment'      // Healthcare treatment
  | 'payment'        // Payment processing
  | 'operations'     // Healthcare operations
  | 'research'       // Medical research (requires consent)
  | 'legal'          // Legal requirement
  | 'quality'        // Quality improvement
  | 'audit';         // Compliance audit

export interface AuditLogEntry {
  id?: string;
  timestamp?: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  action: AuditAction;
  actionCategory?: AuditCategory;
  resourceType: string;
  resourceId?: string;
  resourceOwnerId?: string;
  changes?: AuditChanges;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  success?: boolean;
  errorCode?: string;
  errorMessage?: string;
  phiAccessed?: boolean;
  purpose?: AuditPurpose;
  metadata?: Record<string, unknown>;
}

export interface AuditChanges {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  fieldsChanged?: string[];
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actorEmail: string | null;
  actorRole: string;
  action: AuditAction;
  changes: AuditChanges | null;
  success: boolean;
}

export interface UserActivitySummary {
  action: string;
  count: number;
  lastOccurrence: string;
}

export interface SuspiciousActivity {
  actorId: string;
  actorEmail: string | null;
  actionCount: number;
  failedCount: number;
  uniqueResources: number;
  windowStart: string;
  windowEnd: string;
}

// ============================================================================
// IN-MEMORY FALLBACK (When Supabase is unavailable)
// ============================================================================

interface LocalAuditLog extends AuditLogEntry {
  id: string;
  timestamp: string;
  synced?: boolean;
}

const localAuditLogs: LocalAuditLog[] = [];
const MAX_LOCAL_LOGS = 1000;

function storeLocalAuditLog(entry: AuditLogEntry): string {
  const id = crypto.randomUUID();
  const log: LocalAuditLog = {
    ...entry,
    id,
    timestamp: new Date().toISOString(),
    success: entry.success ?? true,
  };

  localAuditLogs.unshift(log);

  // Trim if exceeds max
  if (localAuditLogs.length > MAX_LOCAL_LOGS) {
    localAuditLogs.pop();
  }

  // Also persist to localStorage for durability
  try {
    const existing = JSON.parse(localStorage.getItem('rehabflow_audit_logs') || '[]');
    existing.unshift(log);
    if (existing.length > MAX_LOCAL_LOGS) existing.pop();
    localStorage.setItem('rehabflow_audit_logs', JSON.stringify(existing));
  } catch {
    // localStorage may be unavailable
  }

  return id;
}

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

/**
 * Log an audit event
 *
 * @example
 * // Log a data read
 * await auditLog({
 *   action: 'READ',
 *   resourceType: 'patient_data',
 *   resourceId: patientId,
 *   phiAccessed: true,
 *   purpose: 'treatment'
 * });
 *
 * @example
 * // Log a data update with changes
 * await auditLog({
 *   action: 'UPDATE',
 *   resourceType: 'exercise_program',
 *   resourceId: programId,
 *   resourceOwnerId: patientId,
 *   changes: {
 *     before: { difficulty: 'easy' },
 *     after: { difficulty: 'medium' },
 *     fieldsChanged: ['difficulty']
 *   }
 * });
 */
export async function auditLog(event: AuditLogEntry): Promise<string | null> {
  // Determine category if not provided
  const category = event.actionCategory || determineCategory(event.action);

  // Attempt Supabase insert
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_action: event.action,
        p_resource_type: event.resourceType,
        p_resource_id: event.resourceId || null,
        p_resource_owner_id: event.resourceOwnerId || null,
        p_changes: event.changes || {},
        p_success: event.success ?? true,
        p_error_message: event.errorMessage || null,
        p_phi_accessed: event.phiAccessed ?? false,
        p_purpose: event.purpose || 'treatment',
        p_metadata: {
          ...event.metadata,
          userAgent: event.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
          sessionId: event.sessionId,
          requestId: event.requestId,
        },
      });

      if (error) {
        console.error('[AuditService] Failed to log to Supabase:', error);
        return storeLocalAuditLog({ ...event, actionCategory: category });
      }

      return data as string;
    } catch (err) {
      console.error('[AuditService] Supabase error:', err);
      return storeLocalAuditLog({ ...event, actionCategory: category });
    }
  }

  // Fallback to local storage
  return storeLocalAuditLog({ ...event, actionCategory: category });
}

/**
 * Log a successful event (convenience wrapper)
 */
export async function auditSuccess(
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  options?: Partial<AuditLogEntry>
): Promise<string | null> {
  return auditLog({
    action,
    resourceType,
    resourceId,
    success: true,
    ...options,
  });
}

/**
 * Log a failed event (convenience wrapper)
 */
export async function auditFailure(
  action: AuditAction,
  resourceType: string,
  errorMessage: string,
  options?: Partial<AuditLogEntry>
): Promise<string | null> {
  return auditLog({
    action,
    resourceType,
    success: false,
    errorMessage,
    ...options,
  });
}

// ============================================================================
// SPECIALIZED AUDIT FUNCTIONS
// ============================================================================

/**
 * Log a data read event
 */
export async function auditRead(
  resourceType: string,
  resourceId: string,
  options?: {
    resourceOwnerId?: string;
    phiAccessed?: boolean;
    purpose?: AuditPurpose;
    metadata?: Record<string, unknown>;
  }
): Promise<string | null> {
  return auditLog({
    action: 'READ',
    resourceType,
    resourceId,
    phiAccessed: options?.phiAccessed ?? isPhiResource(resourceType),
    ...options,
  });
}

/**
 * Log a data creation event
 */
export async function auditCreate(
  resourceType: string,
  resourceId: string,
  data: Record<string, unknown>,
  options?: {
    resourceOwnerId?: string;
    phiAccessed?: boolean;
  }
): Promise<string | null> {
  return auditLog({
    action: 'CREATE',
    resourceType,
    resourceId,
    changes: { after: sanitizeForAudit(data) },
    phiAccessed: options?.phiAccessed ?? isPhiResource(resourceType),
    ...options,
  });
}

/**
 * Log a data update event with before/after tracking
 */
export async function auditUpdate(
  resourceType: string,
  resourceId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  options?: {
    resourceOwnerId?: string;
    phiAccessed?: boolean;
  }
): Promise<string | null> {
  const fieldsChanged = getChangedFields(before, after);

  return auditLog({
    action: 'UPDATE',
    resourceType,
    resourceId,
    changes: {
      before: sanitizeForAudit(before),
      after: sanitizeForAudit(after),
      fieldsChanged,
    },
    phiAccessed: options?.phiAccessed ?? isPhiResource(resourceType),
    ...options,
  });
}

/**
 * Log a data deletion event
 */
export async function auditDelete(
  resourceType: string,
  resourceId: string,
  deletedData?: Record<string, unknown>,
  options?: {
    resourceOwnerId?: string;
  }
): Promise<string | null> {
  return auditLog({
    action: 'DELETE',
    resourceType,
    resourceId,
    changes: deletedData ? { before: sanitizeForAudit(deletedData) } : undefined,
    phiAccessed: isPhiResource(resourceType),
    ...options,
  });
}

/**
 * Log an authentication event
 */
export async function auditAuth(
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'MFA_ENABLE' | 'MFA_DISABLE',
  success: boolean,
  options?: {
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string | null> {
  return auditLog({
    action,
    actionCategory: 'auth',
    resourceType: 'user_session',
    success,
    errorMessage: options?.errorMessage,
    metadata: options?.metadata,
  });
}

/**
 * Log a data export event (GDPR)
 */
export async function auditExport(
  resourceType: string,
  resourceOwnerId: string,
  exportFormat: 'json' | 'pdf' | 'csv',
  recordCount: number
): Promise<string | null> {
  return auditLog({
    action: 'EXPORT',
    resourceType,
    resourceOwnerId,
    phiAccessed: true,
    purpose: 'legal', // GDPR data portability
    metadata: {
      exportFormat,
      recordCount,
    },
  });
}

/**
 * Log a consent event (GDPR)
 */
export async function auditConsent(
  consentType: string,
  granted: boolean,
  resourceOwnerId?: string
): Promise<string | null> {
  return auditLog({
    action: 'CONSENT',
    resourceType: 'consent',
    resourceId: consentType,
    resourceOwnerId,
    metadata: {
      consentType,
      granted,
      timestamp: new Date().toISOString(),
    },
  });
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get audit trail for a specific resource
 */
export async function getResourceAuditTrail(
  resourceType: string,
  resourceId: string,
  limit = 100
): Promise<AuditTrailEntry[]> {
  if (!supabase) {
    // Return from local logs
    return localAuditLogs
      .filter(log => log.resourceType === resourceType && log.resourceId === resourceId)
      .slice(0, limit)
      .map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        actorEmail: log.actorEmail || null,
        actorRole: log.actorRole || 'unknown',
        action: log.action,
        changes: log.changes || null,
        success: log.success ?? true,
      }));
  }

  try {
    const { data, error } = await supabase.rpc('get_resource_audit_trail', {
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_limit: limit,
    });

    if (error) {
      console.error('[AuditService] Failed to get audit trail:', error);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      timestamp: row.timestamp as string,
      actorEmail: row.actor_email as string | null,
      actorRole: row.actor_role as string,
      action: row.action as AuditAction,
      changes: row.changes as AuditChanges | null,
      success: row.success as boolean,
    }));
  } catch (err) {
    console.error('[AuditService] Error getting audit trail:', err);
    return [];
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(
  userId: string,
  days = 30
): Promise<UserActivitySummary[]> {
  if (!supabase) {
    // Calculate from local logs
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const userLogs = localAuditLogs.filter(
      log =>
        (log.actorId === userId || log.resourceOwnerId === userId) &&
        new Date(log.timestamp) >= cutoff
    );

    const summary = new Map<string, { count: number; lastOccurrence: string }>();
    for (const log of userLogs) {
      const existing = summary.get(log.action);
      if (!existing || log.timestamp > existing.lastOccurrence) {
        summary.set(log.action, {
          count: (existing?.count || 0) + 1,
          lastOccurrence: log.timestamp,
        });
      }
    }

    return Array.from(summary.entries())
      .map(([action, data]) => ({
        action,
        count: data.count,
        lastOccurrence: data.lastOccurrence,
      }))
      .sort((a, b) => b.count - a.count);
  }

  try {
    const { data, error } = await supabase.rpc('get_user_activity_summary', {
      p_user_id: userId,
      p_days: days,
    });

    if (error) {
      console.error('[AuditService] Failed to get activity summary:', error);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      action: row.action as string,
      count: Number(row.count),
      lastOccurrence: row.last_occurrence as string,
    }));
  } catch (err) {
    console.error('[AuditService] Error getting activity summary:', err);
    return [];
  }
}

/**
 * Detect suspicious activity patterns
 */
export async function detectSuspiciousActivity(
  windowMinutes = 5,
  threshold = 100
): Promise<SuspiciousActivity[]> {
  if (!supabase) {
    // Calculate from local logs
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recentLogs = localAuditLogs.filter(log => new Date(log.timestamp) >= cutoff);

    const actorMap = new Map<
      string,
      {
        email: string | null;
        count: number;
        failed: number;
        resources: Set<string>;
        timestamps: string[];
      }
    >();

    for (const log of recentLogs) {
      if (!log.actorId) continue;

      const existing = actorMap.get(log.actorId) || {
        email: log.actorEmail || null,
        count: 0,
        failed: 0,
        resources: new Set<string>(),
        timestamps: [],
      };

      existing.count++;
      if (!log.success) existing.failed++;
      if (log.resourceId) existing.resources.add(log.resourceId);
      existing.timestamps.push(log.timestamp);

      actorMap.set(log.actorId, existing);
    }

    return Array.from(actorMap.entries())
      .filter(([, data]) => data.count >= threshold || data.failed >= 10)
      .map(([actorId, data]) => ({
        actorId,
        actorEmail: data.email,
        actionCount: data.count,
        failedCount: data.failed,
        uniqueResources: data.resources.size,
        windowStart: data.timestamps[data.timestamps.length - 1],
        windowEnd: data.timestamps[0],
      }))
      .sort((a, b) => b.actionCount - a.actionCount);
  }

  try {
    const { data, error } = await supabase.rpc('detect_suspicious_activity', {
      p_window_minutes: windowMinutes,
      p_threshold: threshold,
    });

    if (error) {
      console.error('[AuditService] Failed to detect suspicious activity:', error);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      actorId: row.actor_id as string,
      actorEmail: row.actor_email as string | null,
      actionCount: Number(row.action_count),
      failedCount: Number(row.failed_count),
      uniqueResources: Number(row.unique_resources),
      windowStart: row.window_start as string,
      windowEnd: row.window_end as string,
    }));
  } catch (err) {
    console.error('[AuditService] Error detecting suspicious activity:', err);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineCategory(action: AuditAction): AuditCategory {
  if (['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'MFA_ENABLE', 'MFA_DISABLE'].includes(action)) {
    return 'auth';
  }
  if (['ADMIN_ACTION'].includes(action)) {
    return 'admin';
  }
  return 'data';
}

/**
 * Determine if a resource type typically contains PHI
 */
function isPhiResource(resourceType: string): boolean {
  const phiResources = [
    'patient_data',
    'health_data',
    'assessment',
    'pain_log',
    'exercise_log',
    'progress',
    'daily_checkin',
    'medical_history',
    'medication',
    'vital_signs',
    'clinical_notes',
  ];

  return phiResources.some(phi => resourceType.toLowerCase().includes(phi));
}

/**
 * Sanitize data for audit logging (remove sensitive fields)
 */
function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'secret',
    'token',
    'apiKey',
    'accessToken',
    'refreshToken',
    'ssn',
    'socialSecurityNumber',
    'creditCard',
    'cardNumber',
    'cvv',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some(sf => key.toLowerCase().includes(sf.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeForAudit(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get list of changed fields between before and after objects
 */
function getChangedFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): string[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];

  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push(key);
    }
  }

  return changed;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Log multiple audit events in batch (for bulk operations)
 */
export async function auditBatch(events: AuditLogEntry[]): Promise<(string | null)[]> {
  // For now, just call auditLog for each
  // Could be optimized with batch insert in the future
  return Promise.all(events.map(event => auditLog(event)));
}

/**
 * Sync local audit logs to Supabase (for offline-first scenarios)
 */
export async function syncLocalAuditLogs(): Promise<{ synced: number; failed: number }> {
  if (!supabase) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  try {
    const localLogs = JSON.parse(localStorage.getItem('rehabflow_audit_logs') || '[]');
    const unsyncedLogs = localLogs.filter((log: LocalAuditLog) => !log.synced);

    for (const log of unsyncedLogs) {
      try {
        await auditLog(log);
        log.synced = true;
        synced++;
      } catch {
        failed++;
      }
    }

    localStorage.setItem('rehabflow_audit_logs', JSON.stringify(localLogs));
  } catch (err) {
    console.error('[AuditService] Error syncing local logs:', err);
  }

  return { synced, failed };
}
