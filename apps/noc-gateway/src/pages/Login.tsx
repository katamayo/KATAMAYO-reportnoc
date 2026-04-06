import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { signIn, signUp } from '../lib/auth-client';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Login — NOC Report'; }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message || 'Sign up failed');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn.email({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message || 'Invalid credentials');
          setLoading(false);
          return;
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 tech-grid pointer-events-none"></div>
      
      {/* Decorative Gradient Glow */}
      <div className="fixed -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <main className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center rounded-lg mb-4 border border-outline-variant/15">
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary uppercase">NOC Report</h1>
          <p className="text-on-surface-variant text-xs font-label tracking-[0.2em] mt-1 uppercase">Centralized Monitoring</p>
        </div>
        
        {/* Login Container */}
        <div className="glass-panel border border-outline-variant/15 rounded-xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {isSignUp 
                ? 'Register a new operator identity for the Sentinel node.'
                : 'Initialize system authentication to access the Sentinel node.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              <span className="text-sm text-error font-medium">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Input (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="name">
                  Operator Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">badge</span>
                  <input 
                    className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary/40 rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline/50 transition-all text-sm" 
                    id="name" 
                    placeholder="Full Name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="identity">
                Operator Identity
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary/40 rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline/50 transition-all text-sm" 
                  id="identity" 
                  placeholder="Email Address" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-medium uppercase tracking-wider text-on-surface-variant" htmlFor="password">
                  Access Credential
                </label>
                {!isSignUp && (
                  <a className="text-[10px] uppercase font-bold tracking-tighter text-primary hover:text-primary-fixed transition-colors" href="#">
                    Forgot Password
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                <input 
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary/40 rounded-lg py-3 pl-12 pr-4 text-on-surface placeholder:text-outline/50 transition-all text-sm" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            {/* Remember Toggle */}
            {!isSignUp && (
              <div className="flex items-center px-1">
                <input 
                  className="w-4 h-4 rounded-sm border-none bg-surface-container-high text-primary focus:ring-offset-background focus:ring-primary/20 cursor-pointer" 
                  id="remember" 
                  type="checkbox" 
                />
                <label className="ml-2 text-xs text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Maintain persistent session</label>
              </div>
            )}
            
            {/* Action Button */}
            <button 
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold text-sm uppercase tracking-widest py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Initialize Login'}</span>
                  <span className="material-symbols-outlined text-lg">{isSignUp ? 'person_add' : 'login'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
        
        {/* Footer Meta */}
        <div className="mt-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">System Status: Nominal</span>
          </div>
          <p className="text-[10px] text-outline uppercase tracking-widest">
            Protected by The Sentinel Security Protocols • v4.2.0
          </p>
        </div>
      </main>
      
      {/* Side Illustration (Hidden on Mobile) */}
      <div className="hidden lg:block fixed right-12 bottom-12 w-64 h-64 opacity-20 dark:opacity-30">
        <img 
          alt="Technical visualization" 
          className="w-full h-full object-contain grayscale mix-blend-multiply dark:mix-blend-screen invert dark:invert-0" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMRIQjgUacrqk0QkK8RX1dKm08NnmjqZ94NM8KlL4ExyeF84KNfKKUDJ1-u3UWDlXrgZrj91S-n-eCNqFSGb6Uf5AyD2XTlDNLoA2vVIZZ3yxm_BqA4ZcXw78rdi2iawLu1pneX8sCF70BMmeei_AxxeTaupZ-b4060wT5NB6SdwJpbzWr6LqKpftUH1yPBe7hUVe7pBW3cc6HZ_NfW42znoB10T55jPIoCOyWC0gwQrpzmH5lxM4CvDbWxaLcsFKEdhckKoWMm8" 
        />
      </div>
    </div>
  );
}
