/**
 * Invitation Service - Provider Patient Invitations
 *
 * Hanterar email-baserade patientinbjudningar:
 * - Skapa inbjudningar med unika tokens
 * - Validera och acceptera inbjudningar
 * - Spåra status och utgångsdatum
 * - Integration med Supabase (om tillgänglig)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

export interface Invitation {
  id: string;
  providerId: string;
  providerName?: string;
  patientEmail: string;
  patientName?: string;
  token: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
  acceptedAt?: string;
  acceptedBy?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface CreateInvitationInput {
  patientEmail: string;
  patientName?: string;
  message?: string;
  expiresInDays?: number;
}

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
  acceptanceRate: number;
}

// ============================================
// CONSTANTS
// ============================================

const INVITATIONS_KEY = 'rehabflow_invitations';
const PROVIDER_ID_KEY = 'rehabflow_provider_id';
const DEFAULT_EXPIRY_DAYS = 7;

// Supabase config (optional - falls back to localStorage)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch {
  console.warn('Supabase not available, using localStorage fallback');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a cryptographically secure token
 * SECURITY FIX: Uses crypto.getRandomValues() instead of Math.random()
 */
function generateToken(): string {
  // Use Web Crypto API for cryptographically secure random values
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  // Convert to URL-safe base64
  const base64 = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return base64;
}

function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getProviderId(): string {
  let providerId = localStorage.getItem(PROVIDER_ID_KEY);
  if (!providerId) {
    providerId = `provider_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(PROVIDER_ID_KEY, providerId);
  }
  return providerId;
}

function getStoredInvitations(): Invitation[] {
  try {
    const stored = localStorage.getItem(INVITATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveInvitations(invitations: Invitation[]): void {
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Create a new patient invitation
 */
export async function createInvitation(input: CreateInvitationInput): Promise<Invitation> {
  const providerId = getProviderId();
  const now = new Date();
  const expiryDays = input.expiresInDays || DEFAULT_EXPIRY_DAYS;

  const invitation: Invitation = {
    id: generateId(),
    providerId,
    patientEmail: input.patientEmail.toLowerCase().trim(),
    patientName: input.patientName,
    token: generateToken(),
    message: input.message,
    createdAt: now.toISOString(),
    expiresAt: addDays(now, expiryDays).toISOString(),
    status: 'pending'
  };

  // Try Supabase first
  if (supabase) {
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          id: invitation.id,
          provider_id: invitation.providerId,
          patient_email: invitation.patientEmail,
          patient_name: invitation.patientName,
          token: invitation.token,
          message: invitation.message,
          created_at: invitation.createdAt,
          expires_at: invitation.expiresAt,
          status: invitation.status
        });

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase insert failed, using localStorage', err);
    }
  }

  // Always save to localStorage as backup
  const invitations = getStoredInvitations();
  invitations.unshift(invitation);
  saveInvitations(invitations);

  return invitation;
}

/**
 * Get all invitations for current provider
 */
export async function getProviderInvitations(): Promise<Invitation[]> {
  const providerId = getProviderId();

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Map Supabase columns to our interface
        return data.map(row => ({
          id: row.id,
          providerId: row.provider_id,
          patientEmail: row.patient_email,
          patientName: row.patient_name,
          token: row.token,
          message: row.message,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          status: row.status,
          acceptedAt: row.accepted_at,
          acceptedBy: row.accepted_by
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using localStorage', err);
    }
  }

  // Fallback to localStorage
  const invitations = getStoredInvitations();
  return invitations
    .filter(inv => inv.providerId === providerId)
    .map(inv => ({
      ...inv,
      // Update status if expired
      status: inv.status === 'pending' && isExpired(inv.expiresAt) ? 'expired' : inv.status
    }));
}

/**
 * Validate an invitation token
 */
export async function validateToken(token: string): Promise<Invitation | null> {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (!error && data) {
        const invitation: Invitation = {
          id: data.id,
          providerId: data.provider_id,
          patientEmail: data.patient_email,
          patientName: data.patient_name,
          token: data.token,
          message: data.message,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          status: data.status,
          acceptedAt: data.accepted_at,
          acceptedBy: data.accepted_by
        };

        // Check if valid
        if (invitation.status !== 'pending') return null;
        if (isExpired(invitation.expiresAt)) return null;

        return invitation;
      }
    } catch (err) {
      console.warn('Supabase validation failed, using localStorage', err);
    }
  }

  // Fallback to localStorage
  const invitations = getStoredInvitations();
  const invitation = invitations.find(inv => inv.token === token);

  if (!invitation) return null;
  if (invitation.status !== 'pending') return null;
  if (isExpired(invitation.expiresAt)) return null;

  return invitation;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string, patientId: string): Promise<boolean> {
  const invitation = await validateToken(token);
  if (!invitation) return false;

  const now = new Date().toISOString();

  // Try Supabase first
  if (supabase) {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: now,
          accepted_by: patientId
        })
        .eq('token', token);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase update failed, using localStorage', err);
    }
  }

  // Update localStorage
  const invitations = getStoredInvitations();
  const index = invitations.findIndex(inv => inv.token === token);
  if (index !== -1) {
    invitations[index].status = 'accepted';
    invitations[index].acceptedAt = now;
    invitations[index].acceptedBy = patientId;
    saveInvitations(invitations);
  }

  return true;
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<boolean> {
  // Try Supabase first
  if (supabase) {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    } catch (err) {
      console.warn('Supabase cancel failed, using localStorage', err);
    }
  }

  // Update localStorage
  const invitations = getStoredInvitations();
  const index = invitations.findIndex(inv => inv.id === invitationId);
  if (index === -1) return false;

  invitations[index].status = 'cancelled';
  saveInvitations(invitations);
  return true;
}

/**
 * Resend an invitation (creates new token)
 */
export async function resendInvitation(invitationId: string): Promise<Invitation | null> {
  const invitations = getStoredInvitations();
  const original = invitations.find(inv => inv.id === invitationId);

  if (!original) return null;

  // Cancel old invitation
  await cancelInvitation(invitationId);

  // Create new one
  return createInvitation({
    patientEmail: original.patientEmail,
    patientName: original.patientName,
    message: original.message
  });
}

/**
 * Get invitation statistics
 */
export async function getInvitationStats(): Promise<InvitationStats> {
  const invitations = await getProviderInvitations();

  const pending = invitations.filter(inv => inv.status === 'pending').length;
  const accepted = invitations.filter(inv => inv.status === 'accepted').length;
  const expired = invitations.filter(inv => inv.status === 'expired').length;
  const total = invitations.length;

  return {
    total,
    pending,
    accepted,
    expired,
    acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0
  };
}

/**
 * Get invitation by ID
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  const invitations = await getProviderInvitations();
  return invitations.find(inv => inv.id === id) || null;
}

/**
 * Generate invite link
 */
export function generateInviteLink(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite/${token}`;
}

/**
 * Generate email body for invitation
 */
export function generateInviteEmail(invitation: Invitation, providerName: string): {
  subject: string;
  body: string;
} {
  const inviteLink = generateInviteLink(invitation.token);
  const expiryDate = new Date(invitation.expiresAt).toLocaleDateString('sv-SE');

  const subject = `Inbjudan till RehabFlow från ${providerName}`;

  const body = `
Hej${invitation.patientName ? ` ${invitation.patientName}` : ''}!

${providerName} har bjudit in dig att använda RehabFlow för din rehabilitering.

${invitation.message ? `Meddelande från din vårdgivare:\n"${invitation.message}"\n\n` : ''}
Klicka på länken nedan för att komma igång:
${inviteLink}

Inbjudan är giltig till: ${expiryDate}

Med vänliga hälsningar,
RehabFlow-teamet
  `.trim();

  return { subject, body };
}

/**
 * Clear all invitations (for testing)
 */
export function clearAllInvitations(): void {
  localStorage.removeItem(INVITATIONS_KEY);
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const invitationService = {
  createInvitation,
  getProviderInvitations,
  validateToken,
  acceptInvitation,
  cancelInvitation,
  resendInvitation,
  getInvitationStats,
  getInvitationById,
  generateInviteLink,
  generateInviteEmail,
  clearAllInvitations
};

export default invitationService;
