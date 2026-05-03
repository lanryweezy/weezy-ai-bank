import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Lock, User, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import apiClient from '@/services/apiClient';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient<{ user: any; access_token: string; token_type: string }>('/auth/login/token', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        requiresAuth: false
      });
      
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', response.user.is_superuser ? 'platform_admin' : 'user');
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[160px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-[460px] px-8 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center mb-12">
            <div className="bg-indigo-600 p-5 rounded-[32px] shadow-[0_20px_50px_rgba(99,102,241,0.4)] mb-8 relative overflow-hidden group">
                <div className="absolute inset-0 shimmer opacity-20" />
                <Building2 className="h-12 w-12 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic">WEEZY</h1>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">The Cognitive Bank</p>
        </div>

        <Card className="border-none shadow-2xl glass-dark rounded-[48px] overflow-hidden relative group">
          <div className="absolute inset-0 shimmer opacity-[0.03] pointer-events-none" />
          <CardHeader className="pt-12 px-12">
            <CardTitle className="text-3xl font-black text-white text-center tracking-tight">Access Vault</CardTitle>
            <CardDescription className="text-slate-500 text-center font-bold uppercase text-[9px] tracking-[0.2em] mt-3">Identity Encryption Protocol Active</CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl py-3 px-4 text-xs font-bold flex items-center gap-2">
                    <Lock className="h-3 w-3" /> {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <User className="h-4 w-4" />
                    </div>
                    <Input
                        type="text"
                        placeholder="yourname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-14 bg-white/5 border-white/5 pl-12 rounded-2xl text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Lock className="h-4 w-4" />
                    </div>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-14 bg-white/5 border-white/5 pl-12 rounded-2xl text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>Sign In to Vault <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pb-10 px-10 pt-0 flex flex-col gap-6">
            <div className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                <Link to="/forgot-password" title="Coming soon" className="hover:text-indigo-400 transition-colors">Forgot Access?</Link>
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">New Partner?</Link>
            </div>
            
            <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Military-Grade Encryption</span>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-10">
            © 2026 WEEZY BANKING GROUP • NIGERIA
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
