import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-slate-900 to-black shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-white">Galaxy ERP</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white hover:bg-opacity-20"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <main 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white bg-opacity-0"></div>
        
        {/* Content */}
        <div className="relative z-10">
        <div className="text-center">
          <h1 className="text-3xl tracking-tight font-extrabold text-white sm:text-4xl md:text-5xl">
            <span className="block">Enterprise Resource</span>
            <span className="block bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">Planning System</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-white sm:text-xl">
            Streamline your business operations with our comprehensive ERP solution. 
            Manage CRM, sales, inventory, HR, and accounting all in one place.
          </p>
          <div className="mt-8 max-w-sm mx-auto sm:flex sm:justify-center md:mt-10 md:max-w-md">
            <div className="rounded-lg shadow-lg">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-6 py-3 border border-white text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
            <div className="mt-3 rounded-lg shadow-lg sm:mt-0 sm:ml-3">
              <Link
                href="/demo"
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
        </div>
        </div>
      </main>

      {/* Features Section with Background Image */}
      <section 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/images/features-bg.jpg')"
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white bg-opacity-0"></div>
        
        {/* Content */}
        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Everything you need to run your business</h2>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-white">From customer management to financial reporting, we&apos;ve got you covered.</p>
            </div>
          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient1)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Customer Relationship Management</h3>
              <p className="text-sm text-white leading-relaxed">Manage your customers, leads, and sales pipeline in one centralized system.</p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient2)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Sales Management</h3>
              <p className="text-sm text-white leading-relaxed">Track orders, manage products, and analyze sales performance.</p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient3)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Inventory Management</h3>
              <p className="text-sm text-white leading-relaxed">Monitor stock levels, track movements, and optimize inventory.</p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient4)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Human Resources</h3>
              <p className="text-sm text-white leading-relaxed">Manage employees, departments, and organizational structure.</p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient5)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Financial Management</h3>
              <p className="text-sm text-white leading-relaxed">Handle accounting, reporting, and financial analysis.</p>
            </div>

            <div className="text-center group">
              <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 mb-6">
                <svg className="h-10 w-10" fill="none" stroke="url(#gradient6)" strokeWidth={2} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                  </defs>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">Analytics &amp; Reporting</h3>
              <p className="text-sm text-white leading-relaxed">Get insights into your business performance with comprehensive analytics.</p>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
} 