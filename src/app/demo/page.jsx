import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Galaxy ERP Demo</h1>
          <p className="text-xl text-blue-200">Experience the power of our ERP system</p>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Demo Features</h2>
          <p className="text-blue-100 mb-6">
            Our ERP system provides comprehensive business management solutions including:
          </p>
          <ul className="space-y-3 text-blue-100">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Customer Relationship Management (CRM)
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Purchase Order Management
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Inventory Management
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Human Resources Management
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Financial Reporting & Analytics
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Free Trial
          </Link>
          <Link
            href="/"
            className="inline-block ml-4 text-white hover:text-blue-200 py-3 px-8 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

