"use client";

import React from "react";

export default function Breadcrumbs({ items, onNavigate }) {
  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center text-sm text-gray-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const handleClick = () => {
            if (!isLast && typeof onNavigate === "function") {
              onNavigate(index, item);
            }
          };

          return (
            <li key={item.key || item.label} className="flex items-center">
              <button
                type="button"
                onClick={handleClick}
                disabled={isLast}
                className={`hover:text-gray-900 ${
                  isLast ? "text-gray-900 cursor-default" : "text-gray-600"
                }`}
              >
                {item.label}
              </button>
              {!isLast && (
                <span aria-hidden="true" className="px-2 text-gray-400">&gt;</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


