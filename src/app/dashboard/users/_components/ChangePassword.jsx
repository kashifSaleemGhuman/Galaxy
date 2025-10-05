'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ChangePassword({ isFirstLogin }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      console.log('Password changed successfully, signing out and redirecting to login...');
      
      // Show success message before redirect
      setSuccessMessage('Password changed successfully. Please sign in with your new password.');
      
      // Wait a moment to show the success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sign out and redirect to login page
      await signOut({
        redirect: true,
        callbackUrl: `/login?message=${encodeURIComponent('Please sign in with your new password')}`
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  // Only render the form after component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        {isFirstLogin ? 'Change Your Password' : 'Update Password'}
      </h2>
      
      {isFirstLogin && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          For security reasons, you must change your password before continuing.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {!isFirstLogin && (
            <Button
              type="button"
              onClick={() => {/* Close modal or cancel action */}}
              className="bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
