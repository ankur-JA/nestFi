"use client";

import React, { useState } from "react";
import PageHeader from "./_components/PageHeader";
import CreateVaultForm from "./_components/CreateVaultForm";
import SuccessMessage from "./_components/SuccessMessage";

export default function CreateVaultPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return <SuccessMessage />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <CreateVaultForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}