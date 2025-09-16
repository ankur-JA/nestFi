import type { NextPage } from "next";
import { ShieldCheckIcon, LockClosedIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const Security: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 max-w-4xl">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <ShieldCheckIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Security</h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-base-content/80 mb-8">
            Security is our top priority. Learn about our security measures and best practices to keep your funds safe.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <LockClosedIcon className="h-6 w-6 text-primary" />
              Smart Contract Security
            </h2>
            <p>
              Our smart contracts have been designed with security as the primary concern:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Audited Code:</strong> All contracts undergo thorough security audits</li>
              <li><strong>Battle-tested Libraries:</strong> We use OpenZeppelin's proven contract libraries</li>
              <li><strong>Formal Verification:</strong> Critical functions are formally verified</li>
              <li><strong>Bug Bounty Program:</strong> We reward security researchers who find vulnerabilities</li>
              <li><strong>Gradual Rollout:</strong> New features are deployed gradually with monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Security Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-lg">Multi-signature Security</h3>
                  <p className="text-sm">
                    Critical operations require multiple signatures from trusted parties, preventing single points of failure.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-lg">Time-locked Operations</h3>
                  <p className="text-sm">
                    Sensitive changes have mandatory waiting periods, giving users time to react to potential issues.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-lg">Emergency Pause</h3>
                  <p className="text-sm">
                    Critical functions can be paused in emergency situations to protect user funds.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-lg">Upgrade Protection</h3>
                  <p className="text-sm">
                    Contract upgrades follow strict governance procedures and cannot change core security properties.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="alert alert-warning mb-6">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <div>
                <h3 className="font-bold">User Security Best Practices</h3>
                <div className="text-sm mt-2">
                  Your security is also in your hands. Follow these best practices to protect your funds.
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Wallet Security</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Use Hardware Wallets:</strong> Store large amounts in hardware wallets like Ledger or Trezor</li>
              <li><strong>Keep Private Keys Safe:</strong> Never share your private keys or seed phrases</li>
              <li><strong>Verify Addresses:</strong> Always double-check contract addresses before interacting</li>
              <li><strong>Use Separate Wallets:</strong> Keep trading funds separate from long-term holdings</li>
              <li><strong>Enable 2FA:</strong> Use two-factor authentication where available</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Transaction Security</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Verify Transactions:</strong> Always review transaction details before signing</li>
              <li><strong>Check Gas Limits:</strong> Unusually high gas limits may indicate malicious contracts</li>
              <li><strong>Use Reputable Frontends:</strong> Only use official NestFi interfaces</li>
              <li><strong>Monitor Your Accounts:</strong> Regularly check your wallet for unauthorized transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Incident Response</h2>
            <p>
              In the event of a security incident, our response process includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Immediate Assessment:</strong> Quick evaluation of the threat and impact</li>
              <li><strong>Emergency Pause:</strong> Pausing affected contracts if necessary</li>
              <li><strong>User Communication:</strong> Transparent communication through all official channels</li>
              <li><strong>Remediation:</strong> Working with security experts to resolve the issue</li>
              <li><strong>Post-mortem:</strong> Detailed analysis and improvements to prevent future incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Bug Bounty Program</h2>
            <p>
              We believe in the power of the community to help keep NestFi secure. Our bug bounty program rewards 
              security researchers who responsibly disclose vulnerabilities:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Critical:</strong> Up to $100,000 for critical vulnerabilities</li>
              <li><strong>High:</strong> Up to $25,000 for high-severity issues</li>
              <li><strong>Medium:</strong> Up to $5,000 for medium-severity issues</li>
              <li><strong>Low:</strong> Up to $1,000 for low-severity issues</li>
            </ul>
            <p>
              To report a vulnerability, please email:{" "}
              <a href="mailto:security@nestfi.io" className="link link-primary">
                security@nestfi.io
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Audits and Reviews</h2>
            <p>
              NestFi smart contracts have been audited by leading security firms:
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Auditor</th>
                    <th>Date</th>
                    <th>Scope</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Trail of Bits</td>
                    <td>2024-01-15</td>
                    <td>Core Contracts</td>
                    <td><a href="#" className="link link-primary">View Report</a></td>
                  </tr>
                  <tr>
                    <td>Consensys Diligence</td>
                    <td>2024-02-10</td>
                    <td>Strategy Contracts</td>
                    <td><a href="#" className="link link-primary">View Report</a></td>
                  </tr>
                  <tr>
                    <td>OpenZeppelin</td>
                    <td>2024-03-05</td>
                    <td>Governance & Upgrades</td>
                    <td><a href="#" className="link link-primary">View Report</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Security Team</h2>
            <p>
              For security-related inquiries or to report vulnerabilities, please contact our security team:
            </p>
            <ul className="list-disc pl-6">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:security@nestfi.io" className="link link-primary">
                  security@nestfi.io
                </a>
              </li>
              <li>
                <strong>PGP Key:</strong>{" "}
                <a href="#" className="link link-primary">
                  Download Public Key
                </a>
              </li>
              <li><strong>Response Time:</strong> We aim to respond within 24 hours</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Security;
