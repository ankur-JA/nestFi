import type { NextPage } from "next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const Terms: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-4xl">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <DocumentTextIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-base-content/80 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p>
              By accessing or using NestFi ("the Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p>
              NestFi is a decentralized finance (DeFi) platform that allows users to create and manage 
              investment vaults, participate in various DeFi strategies, and interact with blockchain-based 
              financial protocols. The Service is provided "as is" and "as available."
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Risk Disclosure</h2>
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-semibold">Important Risk Warning</span>
            </div>
            <p>
              DeFi protocols involve significant risks, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Smart Contract Risk:</strong> Smart contracts may contain bugs or vulnerabilities</li>
              <li><strong>Market Risk:</strong> Cryptocurrency values can fluctuate dramatically</li>
              <li><strong>Liquidity Risk:</strong> You may not be able to withdraw funds immediately</li>
              <li><strong>Regulatory Risk:</strong> Regulatory changes may affect the Service</li>
              <li><strong>Technical Risk:</strong> Blockchain networks may experience downtime or congestion</li>
            </ul>
            <p>
              <strong>You may lose all or part of your investment. Only invest what you can afford to lose.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <p>As a user of NestFi, you agree to:</p>
            <ul className="list-disc pl-6">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your wallet and private keys</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the Service for illegal or unauthorized purposes</li>
              <li>Not attempt to manipulate or exploit the Service</li>
              <li>Understand the risks associated with DeFi protocols</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
            <p>You may not use the Service for:</p>
            <ul className="list-disc pl-6">
              <li>Money laundering or terrorist financing</li>
              <li>Market manipulation or insider trading</li>
              <li>Violating any laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Distributing malware or harmful code</li>
              <li>Impersonating others or providing false information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. 
              WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES 
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL NESTFI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, 
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless NestFi and its affiliates from and against 
              any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use 
              of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with applicable laws, without 
              regard to conflict of law provisions. Any disputes arising under these Terms shall be 
              resolved through binding arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:legal@nestfi.io" className="link link-primary">
                legal@nestfi.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
