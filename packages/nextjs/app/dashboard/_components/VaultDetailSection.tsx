// app/dashboard/_components/VaultDetailSection.tsx
import React from "react";

interface VaultDetailSectionProps {
  label: string;
  children: React.ReactNode;
}

const VaultDetailSection: React.FC<VaultDetailSectionProps> = ({ label, children }) => {
  return (
    <div className="bg-white/10 p-4 rounded-lg border-2 border-red-500 shadow-lg">
      <h3 className="text-lg font-semibold text-red-400 mb-2">{label}</h3>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  );
};

export default VaultDetailSection;
