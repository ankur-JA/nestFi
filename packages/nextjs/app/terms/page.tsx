"use client";

import type { NextPage } from "next";
import { DocumentTextIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useTheme } from "~~/contexts/ThemeContext";

const Terms: NextPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.1)",
            border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.3)"}`,
          }}
        >
          <DocumentTextIcon className="h-10 w-10 text-blue-500" />
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: isDark ? "#ffffff" : "#0f172a" }}
        >
          Terms of Service
        </h1>

        {/* Coming Soon Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{
            background: isDark ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.1)",
            color: "#f59e0b",
            border: `1px solid ${isDark ? "rgba(251,191,36,0.2)" : "rgba(251,191,36,0.3)"}`,
          }}
        >
          🚧 Coming Soon
        </div>

        {/* Description */}
        <p
          className="text-lg mb-8"
          style={{ color: isDark ? "#9ca3af" : "#64748b" }}
        >
          Our terms of service are being finalized. Please contact us if you have any questions in the meantime.
        </p>

        {/* Contact Section */}
        <div
          className="rounded-xl p-6"
          style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <EnvelopeIcon className="h-5 w-5 text-blue-500" />
            <span
              className="font-medium"
              style={{ color: isDark ? "#ffffff" : "#0f172a" }}
            >
              Contact Us
            </span>
          </div>
          <div className="space-y-2">
            <a
              href="mailto:admin@nestfi.io"
              className="block text-blue-500 hover:text-blue-400 transition-colors"
            >
              admin@nestfi.io
            </a>
            <a
              href="mailto:vikas@nestfi.io"
              className="block text-blue-500 hover:text-blue-400 transition-colors"
            >
              vikas@nestfi.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
