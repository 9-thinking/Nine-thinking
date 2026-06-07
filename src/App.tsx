import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Home,
  LayoutGrid,
  MessageSquare,
  PlusCircle,
  User,
  LogOut,
  TrendingUp,
  Settings,
  Activity,
  Camera,
  Dumbbell,
} from "lucide-react";

// Views
import LandingView from "./views/LandingView";
import LoginView from "./views/LoginView";
import OnboardingView from "./views/OnboardingView";
import DashboardView from "./views/DashboardView";
import VisionLogView from "./views/VisionLogView";
import WorkoutLibraryView from "./views/WorkoutLibraryView";
import ProgressView from "./views/ProgressView";
import ProfileView from "./views/ProfileView";
import RegisterView from "./views/RegisterView";
import ForgotPasswordView from "./views/ForgotPasswordView";
import ProvidersView from "./views/ProvidersView";
import ChatView from "./views/ChatView";
import NotificationsView from "./views/NotificationsView";
import WorkoutDetailView from "./views/WorkoutDetailView";

export type ViewState =
  | "landing"
  | "login"
  | "onboarding"
  | "dashboard"
  | "vision-log"
  | "workouts"
  | "workout-detail"
  | "progress"
  | "profile"
  | "register"
  | "forgot-password"
  | "providers"
  | "chat"
  | "notifications";

export default function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem("nine-thinking-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Smooth scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const handleLogin = (userData: any) => {
    if (!userData) return;
    setUser(userData);
    localStorage.setItem("nine-thinking-user", JSON.stringify(userData));
    if (!userData.age) {
      setView("onboarding");
    } else {
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("nine-thinking-user");
    setView("landing");
  };

  const renderView = () => {
    switch (view) {
      case "landing":
        return <LandingView onNavigate={setView} />;
      case "login":
        return <LoginView onNavigate={setView} onLogin={handleLogin} />;
      case "onboarding":
        return (
          <OnboardingView
            onNavigate={setView}
            user={user}
            onUpdate={handleLogin}
          />
        );
      case "dashboard":
        return <DashboardView onNavigate={setView} user={user} />;
      case "vision-log":
        return <VisionLogView onNavigate={setView} user={user} />;
      case "workouts":
        return <WorkoutLibraryView onNavigate={setView} />;
      case "workout-detail":
        return <WorkoutDetailView onNavigate={setView} />;
      case "progress":
        return <ProgressView onNavigate={setView} user={user} />;
      case "profile":
        return (
          <ProfileView
            onNavigate={setView}
            user={user}
            onLogout={handleLogout}
          />
        );
      case "register":
        return <RegisterView onNavigate={setView} onLogin={handleLogin} />;
      case "forgot-password":
        return <ForgotPasswordView onNavigate={setView} />;
      case "providers":
        return (
          <ProvidersView
            onNavigate={setView}
            onSelectDoctor={(doc) => {
              setSelectedDoctor(doc);
              setView("chat");
            }}
          />
        );
      case "chat":
        return <ChatView onNavigate={setView} doctor={selectedDoctor} />;
      case "notifications":
        return <NotificationsView onNavigate={setView} />;
      default:
        return <LandingView onNavigate={setView} />;
    }
  };

  const showNavbar = ![
    "landing",
    "login",
    "onboarding",
    "register",
    "forgot-password",
    "chat",
    "notifications",
  ].includes(view);

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/10 transition-colors duration-500">
      {/* Dynamic Header */}
      {showNavbar && (
        <header className="glass-nav border-b border-outline-variant/5 px-margin-mobile md:px-margin-desktop py-5 flex justify-between items-center transition-all duration-300">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView("dashboard")}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
              <span className="text-white font-outfit font-black text-lg">
                N
              </span>
            </div>
            <span className="font-outfit font-black text-2xl text-primary tracking-tighter group-active:scale-95 transition-transform">
              Nine Thinking
            </span>
          </div>

          <nav className="hidden md:flex items-center bg-surface-container-low/50 p-1.5 rounded-full border border-outline-variant/10">
            {[
              {
                id: "dashboard" as ViewState,
                label: "Dashboard",
                icon: LayoutGrid,
              },
              {
                id: "progress" as ViewState,
                label: "Trends",
                icon: TrendingUp,
              },
              { id: "vision-log" as ViewState, label: "Vision", icon: Camera },
              { id: "workouts" as ViewState, label: "Fitness", icon: Dumbbell },
            ].map((navItem) => (
              <button
                key={navItem.id}
                onClick={() => setView(navItem.id)}
                className={`relative px-6 py-2.5 rounded-full font-outfit text-sm font-bold transition-all flex items-center gap-2 ${
                  view === navItem.id
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {view === navItem.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white shadow-sm border border-outline-variant/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <navItem.icon
                  className={`relative z-10 w-4 h-4 ${
                    view === navItem.id
                      ? "text-primary"
                      : "text-on-surface-variant/70"
                  }`}
                />
                <span className="relative z-10">{navItem.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <div
              onClick={() => setView("notifications")}
              className="hidden sm:flex relative cursor-pointer hover:scale-110 active:scale-90 transition-all p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high"
            >
              <Activity className="w-5 h-5 text-primary" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="group relative" onClick={() => setView("profile")}>
              <div
                className={`w-11 h-11 rounded-full border-2 p-0.5 cursor-pointer transition-all active:scale-95 duration-300 ${
                  view === "profile"
                    ? "border-primary ring-4 ring-primary/5"
                    : "border-outline-variant/20 hover:border-primary/50"
                }`}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMLjGYLOnfptLhLIMb08pu4p5KGtZcz0QElTgp7o3nRK0pnKWC10SmsU1K0zMyDuoMZTwH3kG5NntpfTpPOgpDfON2KDvPv7zMnlFzPm3Qbk3dIERfvE3erJslVQPtLw_LbnJ-yCOu9h1c6hlTPqGk78TeAXkgCbauDZ6pLVAe3TYdDAyAy11ZP9rUlVUlN02j13tf7QIb1L5b9Nf8VcwD7haU47h5cjm6ZwXScvouKrt5Ae1GVCBgGJL-PLZpfAJCpAtWXNO4NO0"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content with Entrance Animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-grow flex flex-col"
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {showNavbar && (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-white/90 backdrop-blur-2xl border border-outline-variant/10 px-2 py-2 flex justify-around items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {[
            { id: "dashboard" as ViewState, label: "Home", icon: LayoutGrid },
            { id: "workouts" as ViewState, label: "Train", icon: Dumbbell },
            {
              id: "vision-log" as ViewState,
              label: "Scan",
              icon: Camera,
              special: true,
            },
            { id: "progress" as ViewState, label: "Trends", icon: TrendingUp },
            { id: "profile" as ViewState, label: "You", icon: User },
          ].map((navItem) => {
            if (navItem.special) {
              return (
                <button
                  key={navItem.id}
                  onClick={() => setView(navItem.id)}
                  className="flex group flex-col items-center gap-1 relative -mt-10"
                >
                  <div className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center group-active:scale-90 transition-all border-4 border-white">
                    <navItem.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-primary">
                    {navItem.label}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={navItem.id}
                onClick={() => setView(navItem.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                  view === navItem.id
                    ? "text-primary scale-110"
                    : "text-on-surface-variant/40 hover:text-on-surface-variant/70"
                }`}
              >
                <navItem.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {navItem.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Global Scroll Margin for Mobile Nav */}
      {showNavbar && <div className="h-32 md:hidden" />}
    </div>
  );
}
