export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-20 px-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 4, 2026</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            VirtualBoard AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including when you create an account, upload documents, or interact with our AI agents. This may include:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Account information (name, email, password)</li>
            <li>Project data and documents</li>
            <li>Meeting transcripts and chat history</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Process and fulfill your requests</li>
            <li>Personalize your experience with our AI agents</li>
            <li>Analyze usage patterns to improve platform performance</li>
            <li>Communicate with you about updates and security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
      </div>
    </div>
  );
}
