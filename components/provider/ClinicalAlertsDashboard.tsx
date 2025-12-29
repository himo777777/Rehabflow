/**
 * Clinical Alerts Dashboard - Premium Edition
 *
 * A stunning, professional clinical decision support interface with
 * modern glassmorphism, smooth animations, and exceptional UX.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Phone,
  FileEdit,
  ArrowUpRight,
  Eye,
  BookOpen,
  Users,
  Activity,
  Brain,
  Heart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  MessageSquare,
  Calendar,
  ClipboardCheck,
  Lightbulb,
  Shield,
  Zap,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
  Play,
  CheckCheck,
  X,
  MoreHorizontal,
  Stethoscope,
  HeartPulse,
  Timer,
  TrendingDown,
  Waves
} from 'lucide-react';
import {
  ClinicalDecision,
  CDSDashboard,
  CDSPatientSummary,
  InterventionRecommendation,
  ClinicalSignal,
  DecisionPriority,
  getCDSDashboard,
  recordIntervention,
  getClinicalGuidelines,
  ClinicalGuideline
} from '../../services/clinicalDecisionService';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity }
  }
};

const glowVariants = {
  glow: {
    boxShadow: [
      '0 0 20px rgba(239, 68, 68, 0.3)',
      '0 0 40px rgba(239, 68, 68, 0.5)',
      '0 0 20px rgba(239, 68, 68, 0.3)'
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

const priorityConfig = {
  critical: {
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    bgGradient: 'from-red-50 via-rose-50 to-pink-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: AlertTriangle,
    label: 'Kritisk',
    glow: 'shadow-red-200/50'
  },
  high: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: AlertCircle,
    label: 'Hög',
    glow: 'shadow-orange-200/50'
  },
  medium: {
    gradient: 'from-yellow-500 via-lime-500 to-green-500',
    bgGradient: 'from-yellow-50 via-lime-50 to-green-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: Info,
    label: 'Medium',
    glow: 'shadow-yellow-200/50'
  },
  low: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-50 via-cyan-50 to-teal-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: CheckCircle,
    label: 'Låg',
    glow: 'shadow-blue-200/50'
  }
};

const categoryConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  safety: { icon: Shield, label: 'Säkerhet', color: 'text-red-600' },
  pain_management: { icon: HeartPulse, label: 'Smärta', color: 'text-rose-600' },
  exercise_modification: { icon: Activity, label: 'Övningar', color: 'text-blue-600' },
  progression: { icon: TrendingUp, label: 'Progression', color: 'text-green-600' },
  adherence: { icon: Target, label: 'Följsamhet', color: 'text-purple-600' },
  psychological: { icon: Brain, label: 'Psykologi', color: 'text-indigo-600' },
  referral: { icon: ArrowUpRight, label: 'Remiss', color: 'text-cyan-600' },
  monitoring: { icon: Eye, label: 'Övervakning', color: 'text-amber-600' }
};

// ============================================================================
// GLASSMORPHISM CARD COMPONENT
// ============================================================================

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
}> = ({ children, className = '', hover = true, glow }) => (
  <motion.div
    whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
    className={`
      relative overflow-hidden rounded-2xl
      bg-white/80 backdrop-blur-xl
      border border-white/20
      shadow-xl shadow-gray-200/40
      ${glow ? `shadow-2xl ${glow}` : ''}
      ${className}
    `}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
    <div className="relative">{children}</div>
  </motion.div>
);

// ============================================================================
// ANIMATED STAT CARD
// ============================================================================

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  pulse?: boolean;
}> = ({ label, value, icon: Icon, gradient, trend, trendValue, pulse }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -4 }}
    className="relative group"
  >
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <motion.p
            key={value}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
               trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
               <Waves className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <motion.div
          animate={pulse ? { scale: [1, 1.1, 1] } : undefined}
          transition={pulse ? { duration: 1.5, repeat: Infinity } : undefined}
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Decorative bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60`} />
    </GlassCard>
  </motion.div>
);

// ============================================================================
// AI CONFIDENCE INDICATOR
// ============================================================================

const AIConfidenceRing: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="18"
          stroke="url(#aiGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{percentage}%</span>
      </div>
    </div>
  );
};

// ============================================================================
// PREMIUM ALERT CARD
// ============================================================================

const PremiumAlertCard: React.FC<{
  decision: ClinicalDecision;
  onAction: (decision: ClinicalDecision, recommendation: InterventionRecommendation) => void;
  onDismiss: (decision: ClinicalDecision) => void;
  onAcknowledge: (decision: ClinicalDecision) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}> = ({ decision, onAction, onDismiss, onAcknowledge, expanded, onToggleExpand }) => {
  const config = priorityConfig[decision.priority];
  const category = categoryConfig[decision.category] || { icon: Info, label: 'Annat', color: 'text-gray-600' };
  const CategoryIcon = category.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="mb-4"
    >
      <GlassCard
        glow={decision.priority === 'critical' ? config.glow : undefined}
        className={`overflow-hidden ${decision.priority === 'critical' ? 'ring-2 ring-red-400/50' : ''}`}
      >
        {/* Priority gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Category icon with gradient background */}
              <motion.div
                animate={decision.requiresImmediateAction ? pulseVariants.pulse : undefined}
                className={`p-3 rounded-xl bg-gradient-to-br ${config.bgGradient} ${config.border} border`}
              >
                <CategoryIcon className={`w-6 h-6 ${category.color}`} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {decision.title}
                  </h3>

                  {/* Priority badge with gradient */}
                  <span className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                    bg-gradient-to-r ${config.gradient} text-white shadow-sm
                  `}>
                    <config.icon className="w-3 h-3" />
                    {config.label}
                  </span>

                  {/* Immediate action badge */}
                  {decision.requiresImmediateAction && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
                    >
                      <Zap className="w-3 h-3" />
                      Omedelbar åtgärd
                    </motion.span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{decision.description}</p>

                {/* Signals */}
                {decision.signals.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {decision.signals.map((signal, idx) => (
                      <span
                        key={idx}
                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                          ${signal.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                            signal.severity === 'warning' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-blue-100 text-blue-700 border border-blue-200'}
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          signal.severity === 'critical' ? 'bg-red-500' :
                          signal.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        {signal.message}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - AI confidence & expand */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-center">
                <AIConfidenceRing confidence={decision.aiConfidence} />
                <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleExpand}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-gray-100">
                  {/* Rationale */}
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Bakgrund
                    </h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {decision.rationale}
                    </p>
                  </div>

                  {/* Clinical Guideline */}
                  {decision.clinicalGuideline && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-700">Klinisk riktlinje</span>
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-600 font-medium">
                          {decision.clinicalGuideline.evidenceLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{decision.clinicalGuideline.recommendation}</p>
                      <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {decision.clinicalGuideline.source}
                      </p>
                    </motion.div>
                  )}

                  {/* Recommended Actions */}
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      Rekommenderade åtgärder
                    </h4>
                    <div className="space-y-3">
                      {decision.recommendedActions.map((action, idx) => {
                        const ActionIcon = categoryConfig[action.type]?.icon || Lightbulb;
                        return (
                          <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:border-indigo-200 transition-colors">
                                <ActionIcon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-gray-900">{action.title}</h5>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    action.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                                    action.urgency === 'today' ? 'bg-orange-100 text-orange-700' :
                                    action.urgency === 'this_week' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    <Timer className="w-3 h-3 inline mr-1" />
                                    {action.urgency === 'immediate' ? 'Nu' :
                                     action.urgency === 'today' ? 'Idag' :
                                     action.urgency === 'this_week' ? 'Denna vecka' : 'Nästa besök'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{action.description}</p>

                                {action.steps && (
                                  <ul className="space-y-1.5 mt-3">
                                    {action.steps.map((step, stepIdx) => (
                                      <li key={stepIdx} className="flex items-start gap-2 text-xs text-gray-500">
                                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium flex-shrink-0 mt-0.5">
                                          {stepIdx + 1}
                                        </span>
                                        {step}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    Effekt: <span className="font-medium">{
                                      action.estimatedImpact === 'high' ? 'Hög' :
                                      action.estimatedImpact === 'medium' ? 'Medium' : 'Låg'
                                    }</span>
                                  </span>
                                </div>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAction(decision, action)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-shadow"
                              >
                                <Play className="w-4 h-4" />
                                Utför
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onDismiss(decision)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Avfärda
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onAcknowledge(decision)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Bekräfta
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ============================================================================
// PATIENT PRIORITY CARD
// ============================================================================

const PatientPriorityCard: React.FC<{
  patient: CDSPatientSummary;
  rank: number;
}> = ({ patient, rank }) => {
  const riskConfig = {
    critical: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50', text: 'text-red-700' },
    high: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-700' },
    moderate: { gradient: 'from-yellow-500 to-lime-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    low: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700' }
  };

  const config = riskConfig[patient.riskLevel];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      {/* Rank */}
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
        {rank}
      </div>

      {/* Avatar */}
      <div className={`relative w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center overflow-hidden`}>
        <span className={`text-sm font-bold ${config.text}`}>
          {patient.patientName.split(' ').map(n => n[0]).join('')}
        </span>
        {/* Risk indicator */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{patient.patientName}</p>
        <p className="text-xs text-gray-500 truncate">{patient.diagnosis}</p>
      </div>

      {/* Alerts & Score */}
      <div className="flex items-center gap-2">
        {patient.recentAlerts.length > 0 && (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {patient.recentAlerts.length}
          </motion.span>
        )}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
          bg-gradient-to-br ${config.gradient} text-white shadow-lg
        `}>
          {patient.priorityScore}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </motion.div>
  );
};

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

const QuickActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  gradient: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, gradient, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all group"
  >
    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
  </motion.button>
);

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const ClinicalAlertsDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<CDSDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<DecisionPriority | 'all'>('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [guidelines] = useState<ClinicalGuideline[]>(getClinicalGuidelines());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demo decisions
  const [decisions, setDecisions] = useState<ClinicalDecision[]>([
    {
      id: '1',
      patientId: 'p1',
      priority: 'critical',
      category: 'pain_management',
      title: 'Kritisk smärtökning',
      description: 'Anna Eriksson rapporterar smärtnivå 8/10, ökning med 3 poäng sedan igår. Potentiell försämring eller komplikation.',
      rationale: 'Smärtnivå ≥8 eller ökning >4 poäng indikerar potentiell försämring eller komplikation. Omedelbar bedömning krävs för att utesluta röda flaggor.',
      signals: [
        { source: 'pain_alert', severity: 'critical', value: 8, message: 'Smärta 8/10 (+3)', timestamp: new Date().toISOString() }
      ],
      recommendedActions: [
        {
          id: 'a1',
          type: 'contact_patient',
          title: 'Telefon/videokonsultation',
          description: 'Bedöm orsak till smärtökning och uteslut röda flaggor',
          urgency: 'immediate',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: ['Kartlägg smärtdebut och karaktär', 'Fråga om nya symtom', 'Bedöm om aktivitet triggade smärtan']
        },
        {
          id: 'a2',
          type: 'modify_program',
          title: 'Pausa eller reducera program',
          description: 'Tillfälligt reducera träningsintensitet med 50%',
          urgency: 'immediate',
          estimatedImpact: 'medium',
          evidenceLevel: 'moderate'
        }
      ],
      clinicalGuideline: {
        id: 'pain-spike',
        name: 'Pain Spike Protocol',
        source: 'RehabFlow Clinical Protocol',
        condition: 'General',
        recommendation: 'För smärtökning >2 poäng: 1) Reducera intensitet 25%, 2) Kontakt inom 24h, 3) Screening för röda flaggor',
        evidenceLevel: 'Expert Opinion',
        lastUpdated: '2024-03-15'
      },
      aiConfidence: 0.94,
      requiresImmediateAction: true,
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      patientId: 'p3',
      priority: 'high',
      category: 'adherence',
      title: 'Låg följsamhet till träningsprogram',
      description: 'Maria Lindgren har endast 25% följsamhet senaste veckan, vilket riskerar behandlingsutfall.',
      rationale: 'Följsamhet under 40% associeras med sämre behandlingsutfall. Tidigt ingripande kan förbättra utfallet signifikant.',
      signals: [
        { source: 'adherence', severity: 'warning', value: 25, message: 'Följsamhet 25%', timestamp: new Date().toISOString() }
      ],
      recommendedActions: [
        {
          id: 'a3',
          type: 'contact_patient',
          title: 'Motiverande samtal',
          description: 'Utforska hinder och justera förväntningar',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'moderate',
          steps: ['Fråga om hinder', 'Validera upplevelsen', 'Sätt kortsiktiga mål']
        }
      ],
      clinicalGuideline: guidelines.find(g => g.id === 'adherence-intervention'),
      aiConfidence: 0.88,
      requiresImmediateAction: false,
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      patientId: 'p2',
      priority: 'medium',
      category: 'psychological',
      title: 'Förhöjd rörelserädsla',
      description: 'Erik Johansson har TSK-11 score 32/44, vilket indikerar betydande rörelserädsla.',
      rationale: 'Hög kinesiofobi är en stark prediktor för kronisk smärta och nedsatt funktion.',
      signals: [],
      recommendedActions: [
        {
          id: 'a5',
          type: 'educate',
          title: 'Smärtedukation',
          description: 'Aktivera modulen om smärtneurovetenskap',
          urgency: 'this_week',
          estimatedImpact: 'high',
          evidenceLevel: 'strong'
        }
      ],
      aiConfidence: 0.85,
      requiresImmediateAction: false,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ]);

  // Load dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getCDSDashboard('provider-1');
        setDashboard(data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getCDSDashboard('provider-1');
      setDashboard(data);
      setLastRefresh(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, []);

  const handleAction = async (decision: ClinicalDecision, recommendation: InterventionRecommendation) => {
    await recordIntervention(decision, recommendation, 'provider-1');
    setDecisions(prev => prev.map(d => d.id === decision.id ? { ...d, status: 'acted_upon' as const } : d));
  };

  const handleDismiss = (decision: ClinicalDecision) => {
    setDecisions(prev => prev.map(d => d.id === decision.id ? { ...d, status: 'dismissed' as const } : d));
  };

  const handleAcknowledge = (decision: ClinicalDecision) => {
    setDecisions(prev => prev.map(d => d.id === decision.id ? { ...d, status: 'acknowledged' as const } : d));
  };

  const toggleExpand = (id: string) => {
    setExpandedDecisions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredDecisions = useMemo(() =>
    decisions.filter(d => d.status === 'active' && (priorityFilter === 'all' || d.priority === priorityFilter)),
    [decisions, priorityFilter]
  );

  const stats = useMemo(() => ({
    critical: decisions.filter(d => d.priority === 'critical' && d.status === 'active').length,
    high: decisions.filter(d => d.priority === 'high' && d.status === 'active').length,
    pending: decisions.reduce((acc, d) => acc + d.recommendedActions.length, 0),
    completed: decisions.filter(d => d.status === 'acted_upon').length
  }), [decisions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-12 h-12 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                Kliniskt Beslutsstöd
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                AI-drivna rekommendationer i realtid
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {lastRefresh.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGuidelines(!showGuidelines)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  showGuidelines
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Riktlinjer
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Kritiska beslut"
              value={stats.critical}
              icon={AlertTriangle}
              gradient="from-red-500 to-rose-500"
              pulse={stats.critical > 0}
              trend={stats.critical > 0 ? 'up' : 'stable'}
              trendValue={stats.critical > 0 ? 'Kräver åtgärd' : 'Allt OK'}
            />
            <StatCard
              label="Hög prioritet"
              value={stats.high}
              icon={AlertCircle}
              gradient="from-orange-500 to-amber-500"
            />
            <StatCard
              label="Väntande åtgärder"
              value={stats.pending}
              icon={Clock}
              gradient="from-indigo-500 to-purple-500"
            />
            <StatCard
              label="Utförda idag"
              value={stats.completed}
              icon={CheckCircle}
              gradient="from-emerald-500 to-teal-500"
              trend="up"
              trendValue="+2 sedan igår"
            />
          </motion.div>

          {/* Guidelines Panel */}
          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <GlassCard className="p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
                  <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Kliniska riktlinjer
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {guidelines.map((g, idx) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-xl bg-white/80 border border-indigo-100 hover:shadow-md transition-shadow"
                      >
                        <p className="font-semibold text-gray-900 text-sm mb-1">{g.name}</p>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{g.recommendation}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600 font-medium">{g.source}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-600 font-medium">
                            {g.evidenceLevel}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerts Column */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <GlassCard className="overflow-visible">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Aktiva beslut
                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-sm bg-indigo-100 text-indigo-700 font-semibold">
                      {filteredDecisions.length}
                    </span>
                  </h2>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as DecisionPriority | 'all')}
                      className="text-sm border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-gray-600"
                    >
                      <option value="all">Alla</option>
                      <option value="critical">Kritisk</option>
                      <option value="high">Hög</option>
                      <option value="medium">Medium</option>
                      <option value="low">Låg</option>
                    </select>
                  </div>
                </div>

                <div className="p-5">
                  <AnimatePresence mode="popLayout">
                    {filteredDecisions.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <BellOff className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Inga aktiva beslut</p>
                        <p className="text-sm text-gray-400 mt-1">Alla patienter mår bra!</p>
                      </motion.div>
                    ) : (
                      filteredDecisions.map(decision => (
                        <PremiumAlertCard
                          key={decision.id}
                          decision={decision}
                          onAction={handleAction}
                          onDismiss={handleDismiss}
                          onAcknowledge={handleAcknowledge}
                          expanded={expandedDecisions.has(decision.id)}
                          onToggleExpand={() => toggleExpand(decision.id)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Patient Priority */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Patientprioritet
                  </h2>
                </div>
                <div className="p-3">
                  {dashboard?.patients.map((patient, idx) => (
                    <PatientPriorityCard key={patient.patientId} patient={patient} rank={idx + 1} />
                  ))}
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard>
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Snabbåtgärder
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  <QuickActionButton
                    icon={MessageSquare}
                    label="Skicka gruppmeddelande"
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionButton
                    icon={Calendar}
                    label="Schemalägg uppföljningar"
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionButton
                    icon={FileEdit}
                    label="Massuppdatera program"
                    gradient="from-emerald-500 to-teal-500"
                  />
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalAlertsDashboard;
