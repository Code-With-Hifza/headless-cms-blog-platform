import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Privacy Policy | ContentFlow",
  description: "Privacy policy and data protection commitments of the ContentFlow platform.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-8">
          Privacy Policy
        </h1>
        <div className="prose-content">
          <p className="lead">
            At ContentFlow, we believe in privacy-conscious web design and transparent data governance.
          </p>
          <h2>1. Data Collection & Analytics</h2>
          <p>
            We collect anonymized telemetry metrics (such as page views and referrer information) strictly to improve reader experience. We do not use third-party tracking pixels or invasive cross-site cookies.
          </p>
          <h2>2. Newsletter & Email Communications</h2>
          <p>
            When you subscribe to our newsletter, your email address is securely stored for the sole purpose of dispatching editorial digests. Every email contains an instant one-click unsubscribe token.
          </p>
          <h2>3. Comments & User Accounts</h2>
          <p>
            Comments posted publicly will display the author name provided. Email addresses collected during comment submission are never exposed publicly.
          </p>
          <h2>4. Security Standards</h2>
          <p>
            All data in transit is encrypted using modern TLS 1.3 encryption. Passwords stored in our database are hashed using bcrypt with salted entropy.
          </p>
        </div>
      </div>
    </div>
  );
}
