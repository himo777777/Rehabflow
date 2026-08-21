import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Onboarding from './components/Onboarding';
import Logo from './components/Logo';
import Toast, { ToastMessage, ToastType } from './components/Toast';
import InstallPrompt from './components/InstallPrompt';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage, SignupPage } from './components/auth';
import { UserAssessment, GeneratedProgram } from './types';
import { generateRehabProgram } from './services/geminiService';
import { storageService } from './services/storageService';
import { BookOpen, Home, RefreshCw, TrendingUp, Sparkles, Cloud, ShieldAlert, User, Trophy, Heart, Menu, X, Activity, Zap, Brain, AlertCircle } from 'lucide-react';
import { GlassCard, Button, Badge } from './components/ui';
import { logger } from './utils/logger';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { ChatErrorBoundary } from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';

// Lazy load heavier page components
const ProgramView = lazy(() => import('./components/ProgramView'));
const ExerciseLibrary = lazy(() => import('./components/ExerciseLibrary'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
const AIChat = lazy(() => import('./components/AIChat'));
const ProviderDashboard = lazy(() => import('./components/provider/ProviderDashboard'));
const PatientDetail = lazy(() => import('./components/provider/PatientDetail'));

// New feature components
const Achievements = lazy(() => import('./components/Achievements'));
const HealthDataDashboard = lazy(() => import('./components/HealthDataDashboard'));
const ClinicalReport = lazy(() => import('./components/ClinicalReport'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const PainPredictionDashboard = lazy(() => import('./components/PainPredictionDashboard'));

// Premium Page Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
        <div className="relative w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-8 h-8 text-primary-600" />
          </motion.div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-slate-600 font-medium">Laddar...</p>
        <div className="flex justify-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

const LOADING_MESSAGES = [
  "Analyserar din skadeprofil...",
  "Bearbetar dina svar...",
  "Väljer övningar från programmets bibliotek...",
  "Strukturerar rehabiliteringsfaser...",
  "Optimerar belastningsnivåer...",
  "Färdigställer ditt program..."
];

// Main App Content Component
function AppContent() {
  const [program, setProgram] = useState<GeneratedProgram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signOut, hasRole } = useAuth();

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Mobile menu state (must be declared with other hooks, before any early returns)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addToast = (type: ToastType, title: string, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, type, title, message }]);
      // Auto remove after 4s
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load saved program on startup (Async)
  useEffect(() => {
    const initApp = async () => {
        try {
            const savedProgram = await storageService.getProgram();
            if (savedProgram) {
                setProgram(savedProgram);
                // If we are at root and have a program, go to program view
                if (location.pathname === '/') {
                   navigate('/program', { replace: true });
                }
            }
        } catch (e) {
            logger.error("Init failed", e);
        } finally {
            setIsInitializing(false);
        }
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run on mount

  // Rotate loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAssessmentSubmit = async (assessment: UserAssessment) => {
    setIsLoading(true);
    setLoadingMsgIndex(0);
    setError(null);
    try {
      const result = await generateRehabProgram(assessment);
      setProgram(result);
      await storageService.saveProgram(result, assessment);
      addToast('success', 'Program skapat', 'Din rehabplan är klar och sparad.');
      navigate('/program');
    } catch {
      setError("Misslyckades med att skapa program. Kontrollera din anslutning och försök igen.");
      addToast('error', 'Fel vid generering', 'Kunde inte skapa programmet. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Är du säker på att du vill radera ditt nuvarande program och börja om? Detta raderar även din data från molnet.")) {
      setProgram(null);
      storageService.clearProgram().catch((e) => logger.error("Failed to clear program", e));
      addToast('info', 'Återställd', 'Ditt program har raderats.');
      navigate('/');
    }
  };

  // Calculate generic total exercises for progress tracking (simplified based on first phase)
  const totalExercises = program?.phases[0]?.dailyRoutine.flatMap(d => d.exercises).length || 0;

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              {/* Animated Logo */}
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full blur-2xl opacity-50" />
                <div className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <Logo size={48} className="text-white" />
                </div>
              </motion.div>

              {/* Loading text */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">RehabFlow</h2>
                <motion.p
                  className="text-primary-200 font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Hämtar sparade programdata...
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-400 to-cyan-400 rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
      );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-primary-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <GlassCard variant="elevated" className="max-w-md w-full text-center p-10">
            {/* AI Brain Animation */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 border-4 border-primary-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <motion.circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="327"
                  animate={{
                    strokeDashoffset: [327, 0, 327],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B8EFF" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              AI skapar ditt program
            </motion.h2>

            {/* Loading message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingMsgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-8 flex items-center justify-center"
              >
                <Badge variant="gradient" icon={<Sparkles size={12} />}>
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </Badge>
              </motion.div>
            </AnimatePresence>

            {/* Step indicators */}
            <div className="mt-8 flex justify-center gap-2">
              {LOADING_MESSAGES.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === loadingMsgIndex
                      ? 'bg-primary-500 w-6'
                      : i < loadingMsgIndex
                      ? 'bg-primary-400'
                      : 'bg-slate-200'
                  }`}
                  animate={i === loadingMsgIndex ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              ))}
            </div>

            {/* Subtle message */}
            <p className="text-xs text-slate-400 mt-6">
              Detta tar vanligtvis 10-20 sekunder
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { to: '/program', label: 'Hem', icon: Home, requiresProgram: false, showWhenNoProgram: true },
    { to: '/progress', label: 'Framsteg', icon: TrendingUp, requiresProgram: true },
    { to: '/library', label: 'Bibliotek', icon: BookOpen, requiresProgram: false },
    { to: '/achievements', label: 'Utmärkelser', icon: Trophy, requiresProgram: true },
    { to: '/health', label: 'Hälsa', icon: Heart, requiresProgram: true },
    { to: '/pain-insights', label: 'Smärtinsikter', icon: Brain, requiresProgram: true },
  ];

  const visibleNavItems = navItems.filter(item =>
    !item.requiresProgram || (item.requiresProgram && program)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 text-slate-900 font-sans flex flex-col relative overflow-x-hidden w-full">

      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Premium Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-cyan-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-purple-200/30 to-primary-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-gradient-to-br from-cyan-100/20 to-transparent rounded-full blur-[100px]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Premium Floating Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-3 z-50 px-3 sm:px-6 lg:px-8 mb-2 print:hidden"
        role="navigation"
        aria-label="Huvudnavigation"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-2xl px-4 sm:px-6 h-16 flex justify-between items-center transition-all duration-300">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 focus:outline-none group"
              aria-label="RehabFlow - Gå till startsidan"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/30">
                  <Logo size={24} />
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 tracking-tight">
                  RehabFlow
                </span>
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-amber-500" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AI-Powered</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl" role="menubar">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to === '/program' && location.pathname === '/' && program);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`
                        relative px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                        ${isActive
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={16} />
                      <span className="hidden lg:inline">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Reset button */}
              {program && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="ml-2 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                  aria-label="Starta om"
                >
                  <RefreshCw size={16} />
                </motion.button>
              )}

              {/* Auth Section */}
              {!isAuthenticated ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<User size={14} />}
                  onClick={() => setAuthView('login')}
                  className="ml-2"
                >
                  Logga in
                </Button>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  {hasRole('provider') && (
                    <Link to="/provider">
                      <Button variant="success" size="sm" leftIcon={<Activity size={14} />}>
                        Vårdgivarportal
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      addToast('info', 'Utloggad', 'Du har loggats ut.');
                    }}
                    className="px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all text-sm font-medium"
                  >
                    Logga ut
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label="Meny"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="md:hidden mt-2 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-xl p-4 space-y-2"
              >
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth */}
                <div className="pt-2 border-t border-slate-100">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthView('login');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-xl"
                    >
                      <User size={20} />
                      <span className="font-medium">Logga in</span>
                    </button>
                  ) : (
                    <>
                      {hasRole('provider') && (
                        <Link
                          to="/provider"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        >
                          <Activity size={20} />
                          <span className="font-medium">Vårdgivarportal</span>
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          await signOut();
                          setMobileMenuOpen(false);
                          addToast('info', 'Utloggad', 'Du har loggats ut.');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl"
                      >
                        <span className="font-medium">Logga ut</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <main id="main-content" className="flex-grow relative px-4 sm:px-6" role="main" aria-label="Huvudinnehåll">
        {error && (
            <div
              className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4"
              role="alert"
              aria-live="polite"
            >
                <div className="p-2 bg-red-100 rounded-full" aria-hidden="true"><AlertCircle size={16} /></div>
                <div><span className="font-bold">Ett fel uppstod:</span> {error}</div>
            </div>
        )}

        <Suspense fallback={<PageLoader />}>
          <Routes>
              {/* Onboarding / Home Route */}
              <Route path="/" element={
                  program ? <Navigate to="/program" replace /> : (
                      <div className="pt-4 px-4 max-w-5xl mx-auto">
                        {/* Premium Hero Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="text-center mb-12"
                        >
                          {/* Badge */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-cyan-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8 border border-primary-100/50 shadow-sm"
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles size={14} className="text-primary-500" />
                            </motion.div>
                            AI-stött rehabiliterings-MVP
                          </motion.div>

                          {/* Main Heading */}
                          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            <span className="text-slate-900">Rehabilitering på</span>
                            <br />
                            <span className="relative">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-cyan-600 animate-gradient bg-[length:200%_auto]">
                                din kropps villkor.
                              </span>
                              {/* Underline decoration */}
                              <motion.svg
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="absolute -bottom-2 left-0 w-full h-3 text-primary-300"
                                viewBox="0 0 200 12"
                                fill="none"
                              >
                                <motion.path
                                  d="M2 8 C50 3, 150 3, 198 8"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ delay: 0.8, duration: 1 }}
                                />
                              </motion.svg>
                            </span>
                          </h1>

                          {/* Subheading */}
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed"
                          >
                            Utforska ett personanpassat programutkast baserat på{' '}
                            <span className="text-slate-700 font-medium">dina syntetiska eller egna inmatade uppgifter</span>{' '}
                            och programmets strukturerade övningsbibliotek.
                          </motion.p>

                          {/* Trust indicators */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap justify-center gap-6 mt-10"
                          >
                            {[
                              { icon: Activity, text: 'Strukturerat programflöde' },
                              { icon: Brain, text: 'AI-analys' },
                              { icon: ShieldAlert, text: 'Dataskydd kräver verifiering' },
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-slate-500"
                              >
                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                  <item.icon size={14} className="text-slate-600" />
                                </div>
                                {item.text}
                              </div>
                            ))}
                          </motion.div>
                        </motion.div>

                        <SectionErrorBoundary sectionName="Onboarding" fallbackHeight="min-h-[400px]">
                          <Onboarding onSubmit={handleAssessmentSubmit} isLoading={isLoading} />
                        </SectionErrorBoundary>
                      </div>
                  )
              } />

              {/* Program Route - Protected */}
              <Route path="/program" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Träningsprogram" fallbackHeight="min-h-screen">
                      <ProgramView program={program} />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />

              {/* Library Route */}
              <Route path="/library" element={
                <SectionErrorBoundary sectionName="Övningsbibliotek" fallbackHeight="min-h-screen">
                  <ExerciseLibrary />
                </SectionErrorBoundary>
              } />

              {/* Progress Route - Protected */}
              <Route path="/progress" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Framsteg" fallbackHeight="min-h-screen">
                      <ProgressDashboard totalExercisesInRoutine={totalExercises} />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />

              {/* Provider Routes */}
              <Route path="/provider" element={
                  isAuthenticated && hasRole('provider') ? (
                    <SectionErrorBoundary sectionName="Vårdgivare" fallbackHeight="min-h-screen">
                      {selectedPatientId ? (
                        <PatientDetail
                          patientId={selectedPatientId}
                          onBack={() => setSelectedPatientId(null)}
                          onGenerateReport={(_id) => {
                            addToast('info', 'Genererar rapport', 'AI-rapporten skapas...');
                          }}
                        />
                      ) : (
                        <ProviderDashboard
                          onSelectPatient={(id) => setSelectedPatientId(id)}
                          onInvitePatient={() => addToast('info', 'Kommer snart', 'Inbjudningsfunktionen kommer snart.')}
                          onNavigateToSettings={() => addToast('info', 'Kommer snart', 'Inställningar kommer snart.')}
                          onSignOut={async () => {
                            await signOut();
                            navigate('/');
                            addToast('info', 'Utloggad', 'Du har loggats ut.');
                          }}
                        />
                      )}
                    </SectionErrorBoundary>
                  ) : (
                    <Navigate to="/" replace />
                  )
              } />

              {/* New Feature Routes */}
              <Route path="/achievements" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Prestationer" fallbackHeight="min-h-screen">
                      <Achievements />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />
              <Route path="/health" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Hälsodata" fallbackHeight="min-h-screen">
                      <HealthDataDashboard />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />
              <Route path="/report" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Klinisk rapport" fallbackHeight="min-h-screen">
                      <ClinicalReport />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />
              <Route path="/leaderboard" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Topplista" fallbackHeight="min-h-screen">
                      <Leaderboard />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />
              <Route path="/pain-insights" element={
                  program ? (
                    <SectionErrorBoundary sectionName="Smärtinsikter" fallbackHeight="min-h-screen">
                      <PainPredictionDashboard />
                    </SectionErrorBoundary>
                  ) : <Navigate to="/" replace />
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Auth Modal */}
        {authView === 'login' && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAuthView(null)} />
            <div className="absolute inset-0 overflow-y-auto">
              <LoginPage
                onNavigateToSignup={() => setAuthView('signup')}
                onLoginSuccess={() => {
                  setAuthView(null);
                  addToast('success', 'Inloggad', 'Välkommen tillbaka!');
                  if (hasRole('provider')) {
                    navigate('/provider');
                  }
                }}
              />
            </div>
          </div>
        )}

        {authView === 'signup' && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAuthView(null)} />
            <div className="absolute inset-0 overflow-y-auto">
              <SignupPage
                onNavigateToLogin={() => setAuthView('login')}
                onSignupSuccess={() => {
                  setAuthView(null);
                  addToast('success', 'Konto skapat', 'Välkommen till RehabFlow!');
                }}
              />
            </div>
          </div>
        )}
        
        {/* GLOBAL AI CHAT COMPONENT - temporarily disabled due to CommonJS module issue */}
        {/* TODO: Re-enable when running with vercel dev */}
        {/* {program && (
          <ChatErrorBoundary>
            <AIChat program={program} />
          </ChatErrorBoundary>
        )} */}
      </main>

      {/* Premium Footer */}
      <footer className="mt-auto print:hidden relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-100/80" />

        <div className="relative py-16 border-t border-slate-200/50">
          <div className="max-w-6xl mx-auto px-4">
            {/* Main footer content */}
            <div className="flex flex-col items-center">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
                  <Logo size={24} />
                </div>
                <div>
                  <span className="font-bold text-xl text-slate-800">RehabFlow</span>
                  <div className="flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" />
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AI-Powered Rehab</span>
                  </div>
                </div>
              </motion.div>

              {/* Medical Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <GlassCard variant="subtle" padding="md" className="text-left">
                  <div className="flex gap-3">
                    <div className="shrink-0 p-2 bg-red-100 rounded-xl">
                      <ShieldAlert size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800 text-sm mb-1">Medicinsk Friskrivning</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        RehabFlow är ett verktyg för egenvård och ersätter inte professionell medicinsk rådgivning, diagnos eller behandling. Sök alltid råd från läkare eller annan kvalificerad vårdgivare vid frågor om ett medicinskt tillstånd.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                {['Integritetspolicy', 'Användarvillkor', 'Cookie-policy', 'Support'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-slate-500 hover:text-primary-600 transition-colors font-medium"
                  >
                    {link}
                  </a>
                ))}
              </div>

              {/* Copyright and status */}
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-slate-400 text-sm">
                  &copy; {new Date().getFullYear()} RehabFlow. Alla rättigheter förbehållna.
                </p>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full">
                  <span className={`w-2 h-2 rounded-full ${
                    import.meta.env.VITE_SUPABASE_URL
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-400'
                  }`} />
                  <span className="text-[11px] text-slate-500 font-medium">
                    {import.meta.env.VITE_SUPABASE_URL
                      ? 'Cloud Connected'
                      : 'Local Mode'}
                  </span>
                  <Cloud size={12} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      {/* Performance Monitor - only visible in development mode (Ctrl+Shift+P to toggle) */}
      <PerformanceMonitor position="bottom-right" />
    </AuthProvider>
  );
}
