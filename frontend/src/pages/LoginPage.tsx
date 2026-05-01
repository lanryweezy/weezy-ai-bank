import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { useAuth } from '@/contexts/AuthContext'; // Assuming an AuthContext might be created later

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // const { login } = useAuth(); // If using AuthContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Use URLSearchParams for OAuth2 form data
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient<{ user: any; access_token: string; token_type: string }>('/auth/login/token', {
        method: 'POST',
        body: formData, // Overriding the default JSON behavior in apiClient for this specific OAuth2 call
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            {/* Test Credentials Info */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
              <p className="font-semibold mb-1">Test Credentials:</p>
              <p>Admin: <span className="font-mono">admin / admin123</span></p>
              <p>User: <span className="font-mono">user / user123</span></p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Register here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
