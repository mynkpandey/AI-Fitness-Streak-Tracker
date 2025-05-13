import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            By accessing or using FitnessAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            FitnessAI provides an AI-powered fitness tracking platform that helps users maintain workout streaks, track activities, and receive personalized fitness suggestions. The service includes:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Activity tracking and streak monitoring</li>
            <li>AI-powered fitness suggestions</li>
            <li>Progress statistics and insights</li>
            <li>User profile management</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>3. User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To use FitnessAI, you must:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Be at least 13 years of age</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Not share your account credentials</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>4. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            As a user, you agree to:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide accurate activity information</li>
            <li>Not misuse the AI features</li>
            <li>Respect other users' privacy</li>
            <li>Not attempt to reverse engineer the service</li>
            <li>Comply with all applicable laws</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>5. AI-Powered Features</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Our AI features are provided for informational purposes only. You acknowledge that:
          </p>
          <ul className="list-disc pl-6">
            <li>AI suggestions are not medical advice</li>
            <li>You should consult healthcare professionals for medical concerns</li>
            <li>AI responses may not always be accurate</li>
            <li>We are not liable for any decisions made based on AI suggestions</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>6. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            All content and features of FitnessAI are protected by intellectual property laws. You may not:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Copy or modify the service</li>
            <li>Use our trademarks without permission</li>
            <li>Reverse engineer our technology</li>
            <li>Create derivative works</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>7. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            FitnessAI is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Any indirect or consequential damages</li>
            <li>Service interruptions or data loss</li>
            <li>Inaccuracies in AI suggestions</li>
            <li>Third-party actions or content</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>8. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-2">
            Email: legal@fitnessai.com<br />
            Address: 123 Fitness Street, Health City, HC 12345
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 