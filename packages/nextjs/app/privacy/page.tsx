import type { NextPage } from "next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const Privacy: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-4xl">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <ShieldCheckIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-base-content/80 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              NestFi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, and safeguard your information when you use our decentralized 
              application and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">Blockchain Data</h3>
            <p>
              As a decentralized application, NestFi interacts with blockchain networks. All transactions 
              and interactions are recorded on the blockchain and are publicly visible. This includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Wallet addresses</li>
              <li>Transaction hashes</li>
              <li>Smart contract interactions</li>
              <li>Token balances and transfers</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Application Usage</h3>
            <p>We may collect anonymous usage data to improve our services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pages visited</li>
              <li>Features used</li>
              <li>Error logs (anonymized)</li>
              <li>Performance metrics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide and maintain our services</li>
              <li>Improve user experience</li>
              <li>Analyze usage patterns</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information. However, no method 
              of transmission over the internet or electronic storage is 100% secure. We cannot guarantee 
              absolute security of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>
              Our application may integrate with third-party services such as:
            </p>
            <ul className="list-disc pl-6">
              <li>Wallet providers (MetaMask, WalletConnect, etc.)</li>
              <li>Blockchain infrastructure providers</li>
              <li>Analytics services</li>
              <li>DeFi protocols</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have certain rights regarding your personal data, 
              including the right to access, update, or delete your information. Due to the decentralized 
              nature of blockchain technology, some data cannot be modified or deleted once recorded.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:privacy@nestfi.io" className="link link-primary">
                privacy@nestfi.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
