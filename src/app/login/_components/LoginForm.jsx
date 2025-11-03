'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard'); // Redirect to dashboard on success
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login buttons
  const demoLogins = [
    { email: 'admin@galaxy.com', password: 'admin123', label: 'Login as Admin' },
    { email: 'manager@galaxy.com', password: 'manager123', label: 'Login as Manager' },
    { email: 'user@galaxy.com', password: 'user123', label: 'Login as User' }
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email address
          </label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:bg-opacity-30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:bg-opacity-30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-200"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-200 bg-red-500 bg-opacity-20 backdrop-blur-sm p-3 rounded-lg border border-red-400 border-opacity-30">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 via-slate-800 to-black hover:from-blue-700 hover:via-slate-700 hover:to-slate-900 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <span>Sign in</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </form>

      {/* Demo login buttons */}
      <div className="space-y-3 pt-4 border-t border-white border-opacity-20">
        <div className="text-sm text-blue-200 text-center">Demo Logins</div>
        {demoLogins.map((demo) => (
          <Button
            key={demo.email}
            type="button"
            className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-30 rounded-xl py-2 px-4 transition-all duration-200 backdrop-blur-sm"
            onClick={() => {
              setFormData({
                email: demo.email,
                password: demo.password
              });
            }}
          >
            {demo.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
