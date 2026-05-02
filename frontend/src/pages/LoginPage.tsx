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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[440px] px-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
                <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">WEEZY</h1>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1">Cognitive Banking</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/10 rounded-[32px] overflow-hidden">
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl font-bold text-white text-center">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400 text-center font-medium mt-2">Secure access to your AI-native vault.</CardDescription>
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
