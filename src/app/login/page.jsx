import React from 'react';
import LoginForm from './_components/LoginForm';

export default function LoginPage({
  searchParams = {},
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/auth-bg.jpg')"
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Galaxy ERP
            </h1>
            <p className="mt-2 text-lg text-blue-100 drop-shadow-md">
              Enterprise Resource Planning System
            </p>
          </div>
          
          {searchParams.message && (
            <div className="mb-6 p-4 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-blue-100 rounded-lg text-center border border-blue-400 border-opacity-30">
              {searchParams.message}
            </div>
          )}
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Glassmorphism Modal */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl shadow-2xl py-8 px-6 sm:px-10">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-slate-800 to-black rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-slate-800 bg-clip-text text-transparent drop-shadow-md">
                Welcome back
              </h2>
              <p className="mt-2 text-blue-100 text-sm">
                Sign in to your Galaxy ERP account
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}