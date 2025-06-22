import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
      <p className="text-gray-700 mb-8">
        This is a simple Next.js application with Tailwind CSS and UI components.
      </p>
      <Button className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
        Get Started
      </Button>
    </div>
  );
}
