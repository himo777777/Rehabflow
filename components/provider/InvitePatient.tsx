/**
 * Invite Patient Component
 *
 * UI för att bjuda in patienter via email.
 * Features:
 * - Skapa inbjudningar
 * - Visa inbjudningshistorik
 * - Kopiera inbjudningslänk
 * - Skicka om inbjudningar
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Copy,
  Check,
  X,
  Clock,
  UserPlus,
  RefreshCw,
  Trash2,
  Link2,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  Calendar,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import {
  invitationService,
  Invitation,
  InvitationStats,
  generateInviteLink
} from '../../services/invitationService';

interface InvitePatientProps {
  providerName?: string;
  onInviteSent?: (invitation: Invitation) => void;
}

const InvitePatient: React.FC<InvitePatientProps> = ({
  providerName = 'Din vårdgivare',
  onInviteSent
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });
  const [formError, setFormError] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invs, invStats] = await Promise.all([
        invitationService.getProviderInvitations(),
        invitationService.getInvitationStats()
      ]);
      setInvitations(invs);
      setStats(invStats);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email.trim()) {
      setFormError('E-postadress krävs');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFormError('Ogiltig e-postadress');
      return;
    }

    // Check for duplicate
    const existingPending = invitations.find(
      inv => inv.patientEmail === formData.email.toLowerCase() && inv.status === 'pending'
    );
    if (existingPending) {
      setFormError('En aktiv inbjudan finns redan för denna e-post');
      return;
    }

    setIsSending(true);
    try {
      const invitation = await invitationService.createInvitation({
        patientEmail: formData.email,
        patientName: formData.name || undefined,
        message: formData.message || undefined
      });

      setInvitations(prev => [invitation, ...prev]);
      setFormData({ email: '', name: '', message: '' });
      setShowForm(false);

      // Update stats
      const newStats = await invitationService.getInvitationStats();
      setStats(newStats);

      onInviteSent?.(invitation);
    } catch (err) {
      setFormError('Kunde inte skapa inbjudan. Försök igen.');
    } finally {
      setIsSending(false);
    }
  };

  // Copy invite link
  const handleCopyLink = async (invitation: Invitation) => {
    const link = generateInviteLink(invitation.token);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Resend invitation
  const handleResend = async (invitationId: string) => {
    try {
      const newInvitation = await invitationService.resendInvitation(invitationId);
      if (newInvitation) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to resend invitation:', err);
    }
    setActiveMenu(null);
  };

  // Cancel invitation
  const handleCancel = async (invitationId: string) => {
    try {
      await invitationService.cancelInvitation(invitationId);
      setInvitations(prev =>
        prev.map(inv =>
          inv.id === invitationId ? { ...inv, status: 'cancelled' as const } : inv
        )
      );
      const newStats = await invitationService.getInvitationStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to cancel invitation:', err);
    }
    setActiveMenu(null);
  };

  // Get status badge
  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock size={12} />
            Väntar
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle2 size={12} />
            Accepterad
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
            <AlertCircle size={12} />
            Utgången
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            <X size={12} />
            Avbruten
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter invitations
  const pendingInvitations = useMemo(() =>
    invitations.filter(inv => inv.status === 'pending'),
    [invitations]
  );

  const historyInvitations = useMemo(() =>
    invitations.filter(inv => inv.status !== 'pending').slice(0, 10),
    [invitations]
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Laddar inbjudningar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bjud in patienter</h2>
              <p className="text-white/70 text-sm">Skicka inbjudningar via email</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
          >
            <Mail size={18} />
            Ny inbjudan
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-white/70">Totalt</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-xs text-white/70">Väntar</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-2xl font-bold">{stats.accepted}</div>
              <div className="text-xs text-white/70">Accepterade</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-center">
              <div className="text-2xl font-bold">{stats.acceptanceRate}%</div>
              <div className="text-xs text-white/70">Acceptansgrad</div>
            </div>
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Aktiva inbjudningar ({pendingInvitations.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Mail size={18} className="text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 truncate">
                        {invitation.patientName || invitation.patientEmail}
                      </span>
                      {getStatusBadge(invitation.status)}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{invitation.patientEmail}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Skickad {formatDate(invitation.createdAt)} • Utgår {formatDate(invitation.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(invitation)}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedId === invitation.id
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Kopiera länk"
                    >
                      {copiedId === invitation.id ? <Check size={18} /> : <Link2 size={18} />}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === invitation.id ? null : invitation.id)}
                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activeMenu === invitation.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10">
                          <button
                            onClick={() => handleResend(invitation.id)}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <RefreshCw size={16} />
                            Skicka om
                          </button>
                          <button
                            onClick={() => handleCancel(invitation.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Avbryt inbjudan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for pending */}
      {pendingInvitations.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Inga aktiva inbjudningar</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Bjud in dina patienter för att hjälpa dem komma igång med sin rehabilitering.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600"
          >
            Skicka första inbjudan
          </button>
        </div>
      )}

      {/* Invitation history */}
      {historyInvitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              Historik
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {historyInvitations.map(invitation => (
              <div key={invitation.id} className="p-4 opacity-70">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 truncate">
                        {invitation.patientName || invitation.patientEmail}
                      </span>
                      {getStatusBadge(invitation.status)}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{invitation.patientEmail}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(invitation.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New invitation modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Ny inbjudan</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  E-postadress *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Patientens namn (valfritt)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Anna Andersson"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Personligt meddelande (valfritt)
                </label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="T.ex. information om behandlingsplan..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                <p>
                  Patienten får en länk som är giltig i 7 dagar. De behöver inte skapa ett konto
                  för att börja använda appen.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Skickar...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Skicka inbjudan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default InvitePatient;
