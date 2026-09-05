import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Terms of Service | ContentFlow",
  description: "Terms and conditions of use for ContentFlow platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-8">
          Terms of Service
        </h1>
        <div className="prose-content">
          <p className="lead">
            Welcome to ContentFlow. By accessing our platform and APIs, you agree to comply with the following terms.
          </p>
          <h2>1. Acceptable Use</h2>
          <p>
            Users are prohibited from uploading malicious content, attempting injection attacks, scraping private routes, or abusing public endpoints.
          </p>
          <h2>2. Intellectual Property</h2>
          <p>
            Articles, guides, media, and source code published on ContentFlow remain the intellectual property of their respective authors and publishers.
          </p>
          <h2>3. API Usage & Rate Limits</h2>
          <p>
            Our public REST API is available for consumption according to standard rate limit guidelines to ensure uptime and fair access.
          </p>
        </div>
      </div>
    </div>
  );
}
