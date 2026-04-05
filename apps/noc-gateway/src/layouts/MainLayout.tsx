import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSession, signOut } from '../lib/auth-client';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: sessionData, isPending } = useSession();
  const isAuthenticated = !!sessionData?.user;
  const adminName = sessionData?.user?.name || 'Unknown Admin';

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      navigate('/login');
    }
  }, [isPending, isAuthenticated, navigate]);

  const isActive = (path: string) => location.pathname === path;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
    navigate('/login');
  };

  // Show nothing while checking auth
  if (isPending || !isAuthenticated) return null;

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface border-b border-outline-variant/15 font-inter text-sm antialiased">
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold tracking-tight text-primary">NOC Report</div>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-on-surface/70 hover:text-on-surface transition-colors duration-200" href="#">Network Map</a>
            <a className="text-on-surface/70 hover:text-on-surface transition-colors duration-200" href="#">Alerts</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-primary text-on-surface" 
              placeholder="Search logs..." 
              type="text"
            />
          </div>
          <button onClick={toggleTheme} className="p-2 text-primary hover:bg-surface-variant transition-all rounded-full" title="Toggle Theme">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="p-2 text-primary hover:bg-surface-variant transition-all rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/15">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">{adminName}</p>
              <button onClick={handleLogout} className="text-[10px] text-outline hover:text-primary transition-colors cursor-pointer">Logout</button>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-[10px] font-extrabold text-on-primary-container uppercase">
              {adminName.substring(0, 2)}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 pt-20 pb-6 w-64 bg-surface md:bg-surface dark:bg-surface-container-low border-r border-outline-variant/15 z-40">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-lg">security</span>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.05em] text-primary">The Sentinel</h2>
            <p className="text-[10px] text-outline uppercase tracking-wider">Observational Monolith</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${isActive('/dashboard') ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface/50 hover:bg-surface-container-high hover:text-on-surface'}`}>
            <span className="material-symbols-outlined opacity-100 group-hover:translate-x-1 duration-300">dashboard</span>
            <span className="font-inter text-xs uppercase tracking-[0.05em] font-medium">Dashboard</span>
          </Link>
          <Link to="/new-report" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${isActive('/new-report') ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface/50 hover:bg-surface-container-high hover:text-on-surface'}`}>
            <span className="material-symbols-outlined opacity-100 group-hover:translate-x-1 duration-300">add_chart</span>
            <span className="font-inter text-xs uppercase tracking-[0.05em] font-medium">New Report</span>
          </Link>
          <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${isActive('/history') ? 'bg-primary-container/20 text-primary border-l-4 border-primary' : 'text-on-surface/50 hover:bg-surface-container-high hover:text-on-surface'}`}>
            <span className="material-symbols-outlined opacity-100 group-hover:translate-x-1 duration-300">history</span>
            <span className="font-inter text-xs uppercase tracking-[0.05em] font-medium">History</span>
          </Link>
        </nav>
        <div className="px-4 mt-auto">
          <a className="flex items-center gap-3 text-on-surface/50 px-4 py-3 hover:bg-surface-container-high hover:text-on-surface transition-all group" href="#">
            <span className="material-symbols-outlined opacity-100 group-hover:translate-x-1 duration-300">settings</span>
            <span className="font-inter text-xs uppercase tracking-[0.05em] font-medium">Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 pt-24 pb-20 px-6 min-h-screen flex flex-col items-center">
        <Outlet />
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-surface-container-highest/90 backdrop-blur-xl border-t border-outline-variant/15 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
        <Link to="/dashboard" className={`flex flex-col items-center justify-center tap-highlight-transparent scale-90 transition-transform ${isActive('/dashboard') ? 'text-primary bg-primary-container/10 rounded-xl px-4 py-1' : 'text-on-surface/40'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link to="/new-report" className={`flex flex-col items-center justify-center tap-highlight-transparent scale-90 transition-transform ${isActive('/new-report') ? 'text-primary bg-primary-container/10 rounded-xl px-4 py-1' : 'text-on-surface/40'}`}>
          <span className="material-symbols-outlined">add_circle</span>
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">New</span>
        </Link>
        <Link to="/history" className={`flex flex-col items-center justify-center tap-highlight-transparent scale-90 transition-transform ${isActive('/history') ? 'text-primary bg-primary-container/10 rounded-xl px-4 py-1' : 'text-on-surface/40'}`}>
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">History</span>
        </Link>
      </nav>

      {/* Floating Background Elements */}
      <div className="fixed top-1/4 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -left-24 w-80 h-80 bg-tertiary/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
}
