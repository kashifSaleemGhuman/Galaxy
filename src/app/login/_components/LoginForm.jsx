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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Demo login buttons */}
      <div className="space-y-3 pt-4 border-t">
        <div className="text-sm text-gray-500 text-center">Demo Logins</div>
        {demoLogins.map((demo) => (
          <Button
            key={demo.email}
            type="button"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
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
