"use client";

import { motion } from "framer-motion";
import { CreateVaultForm } from "~~/app/createvault/_components/CreateVaultForm";

export default function CreateVault() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Create New Vault</h1>
        <p className="text-gray-500 dark:text-gray-400">Set up a new investment vault with custom parameters</p>
      </div>

      <div className="max-w-2xl">
        <CreateVaultForm />
      </div>
    </motion.div>
  );
}

