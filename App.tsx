import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Logo from './components/Logo';
import Toast, { ToastMessage, ToastType } from './components/Toast';
import InstallPrompt from './components/InstallPrompt';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage, SignupPage } from './components/auth';
import { UserAssessment, GeneratedProgram } from './types';
import { generateRehabProgram } from './services/geminiService';
import { storageService } from './services/storageService';
import { BookOpen, Home, RefreshCw, LogOut, TrendingUp, Sparkles, Cloud, ShieldAlert, User, Trophy, Heart, FileText, Users, Brain } from 'lucide-react';
import Spinner from './components/ui/Spinner';

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

// Page loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <Spinner size="xl" text="Laddar..." centered />
  </div>
);

const LOADING_MESSAGES = [
  "Analyserar din skadeprofil...",
  "Konsulterar kliniska riktlinjer...",
  "Väljer ut evidensbaserade övningar...",
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
  const { user, isAuthenticated, signOut, hasRole } = useAuth();

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
            console.error("Init failed", e);
        } finally {
            setIsInitializing(false);
        }
    };
    initApp();
  }, []);

  // Rotate loading messages
  useEffect(() => {
    let interval: any;
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
    } catch (err) {
      setError("Misslyckades med att skapa program. Kontrollera din anslutning och försök igen.");
      addToast('error', 'Fel vid generering', 'Kunde inte skapa programmet. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Är du säker på att du vill radera ditt nuvarande program och börja om? Detta raderar även din data från molnet.")) {
      setProgram(null);
      storageService.clearProgram().catch(console.error);
      addToast('info', 'Återställd', 'Ditt program har raderats.');
      navigate('/');
    }
  };

  // Calculate generic total exercises for progress tracking (simplified based on first phase)
  const totalExercises = program?.phases[0]?.dailyRoutine.flatMap(d => d.exercises).length || 0;

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-500 font-medium animate-pulse">Hämtar din journal...</p>
              </div>
          </div>
      );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/50 relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-[6px] border-primary-500 rounded-full border-t-transparent animate-spin"></div>
             <Logo className="absolute inset-0 m-auto text-primary-500 animate-pulse" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Skapar ditt program</h2>
          <p className="text-slate-500 h-6 transition-all duration-500 fade-in font-medium">
             {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden w-full">
      
      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-6 print:hidden" role="navigation" aria-label="Huvudnavigation">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-lg rounded-2xl px-6 h-16 flex justify-between items-center transition-all duration-300">
            <Link
                to="/"
                className="flex items-center gap-3 focus:outline-none group"
                aria-label="RehabFlow - Gå till startsidan"
            >
              <div className="text-primary-600 transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
                <Logo size={32} />
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                RehabFlow
              </span>
            </Link>
            
            <div className="flex items-center gap-2">
               <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-xl" role="menubar">
                 <Link
                    to="/program"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/program' || (location.pathname === '/' && program) ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    aria-label="Hem - Ditt träningsprogram"
                    aria-current={location.pathname === '/program' ? 'page' : undefined}
                 >
                    <Home size={18} aria-hidden="true" /> <span className="hidden lg:inline">Hem</span>
                 </Link>

                 {program && (
                    <Link
                        to="/progress"
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/progress' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        aria-label="Framsteg - Se din utveckling"
                        aria-current={location.pathname === '/progress' ? 'page' : undefined}
                    >
                        <TrendingUp size={18} aria-hidden="true" /> <span className="hidden lg:inline">Framsteg</span>
                    </Link>
                 )}

                 <Link
                    to="/library"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/library' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    aria-label="Övningsbibliotek"
                    aria-current={location.pathname === '/library' ? 'page' : undefined}
                 >
                    <BookOpen size={18} aria-hidden="true" /> <span className="hidden lg:inline">Bibliotek</span>
                 </Link>

                 {program && (
                    <>
                      <Link
                        to="/achievements"
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/achievements' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        aria-label="Utmärkelser och poäng"
                        aria-current={location.pathname === '/achievements' ? 'page' : undefined}
                      >
                        <Trophy size={18} aria-hidden="true" /> <span className="hidden lg:inline">Utmärkelser</span>
                      </Link>
                      <Link
                        to="/health"
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/health' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                        aria-label="Hälsodata"
                        aria-current={location.pathname === '/health' ? 'page' : undefined}
                      >
                        <Heart size={18} aria-hidden="true" /> <span className="hidden lg:inline">Hälsa</span>
                      </Link>
                    </>
                 )}
               </div>

               {program && (
                  <button
                    onClick={handleReset}
                    className="ml-4 px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                    aria-label="Starta om - Radera nuvarande program och börja om"
                  >
                    <RefreshCw size={18} aria-hidden="true" /> <span className="hidden md:inline text-sm font-medium">Starta om</span>
                  </button>
               )}

               {/* Auth Button */}
               {!isAuthenticated ? (
                  <button
                    onClick={() => setAuthView('login')}
                    className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all flex items-center gap-2"
                  >
                    <User size={16} /> Logga in
                  </button>
               ) : (
                  <div className="ml-2 flex items-center gap-2">
                    {hasRole('provider') && (
                      <Link
                        to="/provider"
                        className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all"
                      >
                        Vårdgivarportal
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        await signOut();
                        addToast('info', 'Utloggad', 'Du har loggats ut.');
                      }}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-sm"
                    >
                      Logga ut
                    </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow relative px-4 sm:px-6" role="main" aria-label="Huvudinnehåll">
        {error && (
            <div
              className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4"
              role="alert"
              aria-live="polite"
            >
                <div className="p-2 bg-red-100 rounded-full" aria-hidden="true"><LogOut size={16} /></div>
                <div><span className="font-bold">Ett fel uppstod:</span> {error}</div>
            </div>
        )}

        <Suspense fallback={<PageLoader />}>
          <Routes>
              {/* Onboarding / Home Route */}
              <Route path="/" element={
                  program ? <Navigate to="/program" replace /> : (
                      <div className="pt-8 px-4 max-w-5xl mx-auto">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6 border border-primary-100">
                                <Sparkles size={12} /> AI-Driven Fysioterapi
                            </div>
                            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                              Rehabilitering på <br className="hidden sm:block" />
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">din kropps villkor.</span>
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
                              Få ett skräddarsytt återhämtningsprogram baserat på klinisk evidens, din skadehistorik och den senaste medicinska forskningen.
                            </p>
                        </div>
                        <Onboarding onSubmit={handleAssessmentSubmit} isLoading={isLoading} />
                      </div>
                  )
              } />

              {/* Program Route - Protected */}
              <Route path="/program" element={
                  program ? <ProgramView program={program} /> : <Navigate to="/" replace />
              } />

              {/* Library Route */}
              <Route path="/library" element={<ExerciseLibrary />} />

              {/* Progress Route - Protected */}
              <Route path="/progress" element={
                  program ? <ProgressDashboard totalExercisesInRoutine={totalExercises} /> : <Navigate to="/" replace />
              } />

              {/* Provider Routes */}
              <Route path="/provider" element={
                  isAuthenticated && hasRole('provider') ? (
                    selectedPatientId ? (
                      <PatientDetail
                        patientId={selectedPatientId}
                        onBack={() => setSelectedPatientId(null)}
                        onGenerateReport={(id) => {
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
                    )
                  ) : (
                    <Navigate to="/" replace />
                  )
              } />

              {/* New Feature Routes */}
              <Route path="/achievements" element={
                  program ? <Achievements /> : <Navigate to="/" replace />
              } />
              <Route path="/health" element={
                  program ? <HealthDataDashboard /> : <Navigate to="/" replace />
              } />
              <Route path="/report" element={
                  program ? <ClinicalReport /> : <Navigate to="/" replace />
              } />
              <Route path="/leaderboard" element={
                  program ? <Leaderboard /> : <Navigate to="/" replace />
              } />
              <Route path="/pain-insights" element={
                  program ? <PainPredictionDashboard /> : <Navigate to="/" replace />
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
        
        {/* GLOBAL AI CHAT COMPONENT */}
        {program && <AIChat program={program} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 print:hidden bg-slate-100/50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-primary-600">
                <Logo size={32} />
                <span className="font-bold text-lg text-slate-700">RehabFlow</span>
            </div>
            
            <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50/50 rounded-xl border border-red-100 text-left">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wide mb-2">
                    <ShieldAlert size={14} /> Medicinsk Friskrivning
                </div>
                <p className="text-xs text-red-900/70 leading-relaxed">
                    RehabFlow är ett verktyg för egenvård och ersätter inte professionell medicinsk rådgivning, diagnos eller behandling. Sök alltid råd från läkare eller annan kvalificerad vårdgivare vid frågor om ett medicinskt tillstånd. Sluta omedelbart med övningar om du upplever skarp smärta eller obehag.
                </p>
            </div>

            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                &copy; {new Date().getFullYear()} RehabFlow. Alla rättigheter förbehållna.
            </p>
            
            <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <a href="#" className="hover:text-primary-600 transition-colors">Integritetspolicy</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Användarvillkor</a>
            </div>

            <div className="flex items-center justify-center gap-1 mt-6 text-[10px] text-slate-300">
                <Cloud size={10} /> {process.env.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL ? 'Enterprise Cloud Connected' : 'Local Mode'}
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
    </AuthProvider>
  );
}