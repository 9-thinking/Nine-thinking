import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Camera,
  Dumbbell,
  LayoutGrid,
  TrendingUp,
  User
} from 'lucide-react';

import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import CalorieScannerView from './views/CalorieScannerView';
import WorkoutLibraryView from './views/WorkoutLibraryView';
import ProgressView from './views/ProgressView';
import ProfileView from './views/ProfileView';
import RegisterView from './views/RegisterView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ProvidersView from './views/ProvidersView';
import ChatView from './views/ChatView';
import NotificationsView from './views/NotificationsView';
import WorkoutDetailView from './views/WorkoutDetailView';

export type ViewState =
  | 'landing'
  | 'login'
  | 'onboarding'
  | 'dashboard'
  | 'vision-log'
  | 'workouts'
  | 'workout-detail'
  | 'progress'
  | 'profile'
  | 'register'
  | 'forgot-password'
  | 'providers'
  | 'chat'
  | 'notifications';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nine-thinking-user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [view]);

  const handleLogin = (userData: any) => {
    if (!userData) return;

    setUser(userData);

    localStorage.setItem(
      'nine-thinking-user',
      JSON.stringify(userData)
    );

    if (!userData.age) {
      setView('onboarding');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);

    localStorage.removeItem(
      'nine-thinking-user'
    );

    setView('landing');
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <LandingView
            onNavigate={setView}
          />
        );

      case 'login':
        return (
          <LoginView
            onNavigate={setView}
            onLogin={handleLogin}
          />
        );

      case 'register':
        return (
          <RegisterView
            onNavigate={setView}
            onLogin={handleLogin}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordView
            onNavigate={setView}
          />
        );

      case 'onboarding':
        return (
          <OnboardingView
            onNavigate={setView}
            user={user}
            onUpdate={handleLogin}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setView}
            user={user}
          />
        );

      case 'vision-log':
        return (
          <CalorieScannerView
            onNavigate={setView}
            user={user}
          />
        );

      case 'workouts':
        return (
          <WorkoutLibraryView
            onNavigate={setView}
            user={user}
          />
        );

      case 'workout-detail':
        return (
          <WorkoutDetailView
            onNavigate={setView}
          />
        );

      case 'progress':
        return (
          <ProgressView
            onNavigate={setView}
            user={user}
          />
        );

      case 'profile':
        return (
          <ProfileView
            onNavigate={setView}
            user={user}
            onLogout={handleLogout}
          />
        );

      case 'providers':
        return (
          <ProvidersView
            onNavigate={setView}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setView('chat');
            }}
          />
        );

      case 'chat':
        return (
          <ChatView
            onNavigate={setView}
            doctor={selectedDoctor}
          />
        );

      case 'notifications':
        return (
          <NotificationsView
            onNavigate={setView}
          />
        );

      default:
        return (
          <LandingView
            onNavigate={setView}
          />
        );
    }
  };

  const showNavbar =
    ![
      'landing',
      'login',
      'register',
      'forgot-password',
      'onboarding',
      'chat',
      'notifications'
    ].includes(view);

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/10 transition-colors duration-500">

      {showNavbar && (
        <header className="glass-nav border-b border-outline-variant/5 px-margin-mobile md:px-margin-desktop py-5 flex justify-between items-center">

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView('dashboard')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">
                N
              </span>
            </div>

            <span className="font-outfit font-black text-2xl text-primary">
              Nine Thinking
            </span>
          </div>

          <nav className="hidden md:flex items-center bg-surface-container-low/50 p-1.5 rounded-full border">

            {[
              {
                id: 'dashboard' as ViewState,
                label: 'Dashboard',
                icon: LayoutGrid
              },
              {
                id: 'progress' as ViewState,
                label: 'Trends',
                icon: TrendingUp
              },
              {
                id: 'vision-log' as ViewState,
                label: 'Calorie Scanner',
                icon: Camera
              },
              {
                id: 'workouts' as ViewState,
                label: 'Fitness',
                icon: Dumbbell
              }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative px-6 py-2.5 rounded-full flex items-center gap-2 ${
                  view === item.id
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                }`}
              >
                {view === item.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-full"
                  />
                )}

                <item.icon className="relative z-10 w-4 h-4" />

                <span className="relative z-10">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setView('notifications')
              }
            >
              <Activity className="w-5 h-5 text-primary" />
            </button>

            <button
              onClick={() =>
                setView('profile')
              }
            >
              <User className="w-6 h-6 text-primary" />
            </button>

          </div>
        </header>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-grow"
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>

      {showNavbar && (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-[32px] px-2 py-2 flex justify-around">

          {[
            {
              id: 'dashboard' as ViewState,
              label: 'Home',
              icon: LayoutGrid
            },
            {
              id: 'workouts' as ViewState,
              label: 'Train',
              icon: Dumbbell
            },
            {
              id: 'vision-log' as ViewState,
              label: 'Scan',
              icon: Camera
            },
            {
              id: 'progress' as ViewState,
              label: 'Trends',
              icon: TrendingUp
            },
            {
              id: 'profile' as ViewState,
              label: 'You',
              icon: User
            }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex flex-col items-center gap-1"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      )}

      {showNavbar && (
        <div className="h-32 md:hidden" />
      )}
    </div>
  );
}