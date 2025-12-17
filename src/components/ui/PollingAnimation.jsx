'use client';

import React from 'react';

export default function PollingAnimation({ isPolling = true, size = 'large' }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  return (
    <div className={`${sizeClasses[size]} relative mx-auto`}>
      {/* Outer radar ring - slow rotation */}
      <div className={`${sizeClasses[size]} absolute inset-0 border-4 border-blue-300 rounded-full animate-spin`} 
           style={{ animationDuration: '3s' }}>
      </div>
      
      {/* Middle radar ring - medium rotation */}
      <div className={`${sizeClasses[size]} absolute inset-2 border-3 border-blue-400 rounded-full animate-spin`} 
           style={{ animationDuration: '2s' }}>
      </div>
      
      {/* Inner radar ring - fast rotation */}
      <div className={`${sizeClasses[size]} absolute inset-4 border-2 border-blue-500 rounded-full animate-spin`} 
           style={{ animationDuration: '1s' }}>
      </div>
      
      {/* Center pulsing dot */}
      <div className={`${sizeClasses[size]} absolute inset-0 flex items-center justify-center`}>
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"
             style={{ animationDuration: '1.5s' }}>
        </div>
      </div>
      
      {/* Radar sweep effect */}
      <div className={`${sizeClasses[size]} absolute inset-0 rounded-full overflow-hidden`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40 animate-pulse"
             style={{ 
               animationDuration: '2s',
               transform: 'rotate(30deg)',
               transformOrigin: 'center'
             }}>
        </div>
      </div>
      
      {/* Expanding pulse rings */}
      <div className={`${sizeClasses[size]} absolute inset-0 rounded-full border-2 border-blue-200 animate-ping`}
           style={{ animationDuration: '2s' }}>
      </div>
    </div>
  );
}
