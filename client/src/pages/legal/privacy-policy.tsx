import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            At FitnessAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fitness tracking application.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Username and email address</li>
            <li>Workout history and activity data</li>
            <li>Fitness goals and preferences</li>
            <li>Device information and usage statistics</li>
          </ul>

          <h3 className="font-semibold mb-2">How We Use Your Information</h3>
          <ul className="list-disc pl-6">
            <li>To provide and maintain our service</li>
            <li>To personalize your fitness experience</li>
            <li>To improve our AI-powered suggestions</li>
            <li>To communicate with you about updates and features</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <ul className="list-disc pl-6">
            <li>Data encryption in transit and at rest</li>
            <li>Secure authentication protocols</li>
            <li>Regular security audits</li>
            <li>Access controls and monitoring</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We use the following third-party services that may collect information about you:
          </p>
          <ul className="list-disc pl-6">
            <li>Google Gemini AI for personalized fitness suggestions</li>
            <li>MongoDB Atlas for data storage</li>
            <li>Analytics services to improve our application</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: privacy@fitnessai.com<br />
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