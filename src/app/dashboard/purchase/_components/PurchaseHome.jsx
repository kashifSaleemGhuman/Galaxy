'use client'



export function PurchaseHome({ onStartNow }) {
  

  const handleStartNow = () => {
    if (typeof onStartNow === 'function') {
      onStartNow();
    }
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Resupply faster and never run out of stock
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
        From RFQs to receipts, from product variants to vendor bills... kick back and let Odoo's all-in-one procurement software do the work for you.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={handleStartNow}
            className="px-6 py-3 mr-4 rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow"
          >
            Start now - It's free
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-md bg-gray-100 text-slate-800 hover:bg-gray-200 border border-gray-200 shadow-sm"
          >
            Meet an advisor  <span className="ml-2">▾</span>
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Free, forever, with unlimited users. <span className="text-teal-700 underline cursor-pointer">See why</span>
        </p>
      </div>
    </div>
  )
}


