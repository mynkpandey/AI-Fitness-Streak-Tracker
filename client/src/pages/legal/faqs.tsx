import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQs() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>General Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is-fitnessai">
              <AccordionTrigger>What is FitnessAI?</AccordionTrigger>
              <AccordionContent>
                FitnessAI is an AI-powered fitness tracking application that helps you maintain workout streaks, track activities, and get personalized fitness suggestions using Google's Gemini AI technology.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-does-ai-work">
              <AccordionTrigger>How does the AI feature work?</AccordionTrigger>
              <AccordionContent>
                Our AI uses Google's Gemini API to analyze your workout history, current streak, and goals to provide personalized fitness suggestions and health advice. The AI considers your activity patterns to give relevant recommendations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-privacy">
              <AccordionTrigger>How is my data protected?</AccordionTrigger>
              <AccordionContent>
                We take data privacy seriously. Your workout data is stored securely in MongoDB Atlas with encryption. We never share your personal information with third parties without your consent. Read our Privacy Policy for more details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="create-account">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                You can create an account by clicking the "Sign Up" button on the homepage. You'll need to provide a username, email, and password. We use secure authentication to protect your account.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="track-activities">
              <AccordionTrigger>How do I track my activities?</AccordionTrigger>
              <AccordionContent>
                You can log your activities through the dashboard by clicking the "Add Activity" button. Enter the type of activity, duration, and any additional notes. The app will automatically update your streak and statistics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="streak-system">
              <AccordionTrigger>How does the streak system work?</AccordionTrigger>
              <AccordionContent>
                Your streak increases by one day for each consecutive day you complete a workout. If you miss a day, your streak resets to zero. The app tracks your longest streak and provides motivation to maintain consistency.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support & Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="contact-support">
              <AccordionTrigger>How can I contact support?</AccordionTrigger>
              <AccordionContent>
                You can reach our support team through the contact form in the app or email us at support@fitnessai.com. We typically respond within 24 hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="report-issues">
              <AccordionTrigger>How do I report issues?</AccordionTrigger>
              <AccordionContent>
                If you encounter any issues, please use the "Report Issue" button in the settings menu or contact our support team directly. Include as much detail as possible about the problem you're experiencing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="feature-requests">
              <AccordionTrigger>Can I suggest new features?</AccordionTrigger>
              <AccordionContent>
                Yes! We welcome feature suggestions. You can submit your ideas through the "Feature Request" form in the settings menu or email us at features@fitnessai.com.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 