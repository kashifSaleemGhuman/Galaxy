"use client";

import { useState } from "react";

export default function GetStartedFormPage() {

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    language: "",
    size: "",
    interest: "",
  });

  const [isPurchaseDashboardVisible, setIsPurchaseDashboardVisible] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fields = [
    {
      key: "name",
      label: "First and Last Name",
      type: "text",
      colSpan: 2,
      placeholder: "",
    },
    { key: "company", label: "Company Name", type: "text", colSpan: 2 },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone Number", type: "text", placeholder: "+92" },
    { key: "country", label: "Country", type: "select", options: ["Pakistan"] },
    {
      key: "language",
      label: "Language",
      type: "select",
      options: ["English"],
    },
    {
      key: "size",
      label: "Company size",
      type: "select",
      options: ["1 - 5 employees"],
    },
    {
      key: "interest",
      label: "Primary Interest",
      type: "select",
      options: ["Use it in my company"],
    },
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPurchaseDashboardVisible(true);
  };

  return (
    <>
    {isPurchaseDashboardVisible ? (
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">You're all set</h2>
        <p className="text-gray-700">Thanks for getting started. We'll use your preferences to tailor the purchase dashboard.</p>
      </div>
    ) : (
      <div className="bg-white shadow-md rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-sm bg-gradient-to-r from-fuchsia-500 to-teal-400"></span>
          <h1 className="text-2xl font-semibold text-gray-900">Get Started</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className={f.colSpan === 2 ? "sm:col-span-2" : ""}>
            <label className="block text-sm text-gray-700 mb-1">
              {f.label}
            </label>
            {f.type === "select" ? (
              <select
                name={f.key}
                value={formData[f.key]}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
                onChange={handleChange}
              >
                <option value="">Select</option>
                {(f.options || []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                name={f.key}
                value={formData[f.key]}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
                placeholder={f.placeholder || ""}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        <div className="col-span-1 sm:col-span-2 pt-2">
          <button
            type="submit"
            className="w-full block px-6 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Start Now
          </button>
        </div>
      </form>
    </div>
    )}
    </>
  );
}
