"use client";

import type { NextPage } from "next";
import { ShieldCheckIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useTheme } from "~~/contexts/ThemeContext";

const Security: NextPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.1)",
            border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.3)"}`,
          }}
        >
          <ShieldCheckIcon className="h-10 w-10 text-violet-500" />
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: isDark ? "#ffffff" : "#0f172a" }}
        >
          Security
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
          Our security documentation and audit reports are being prepared. For security inquiries, please reach out directly.
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
            <EnvelopeIcon className="h-5 w-5 text-violet-500" />
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
              className="block text-violet-500 hover:text-violet-400 transition-colors"
            >
              admin@nestfi.io
            </a>
            <a
              href="mailto:vikas@nestfi.io"
              className="block text-violet-500 hover:text-violet-400 transition-colors"
            >
              vikas@nestfi.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
