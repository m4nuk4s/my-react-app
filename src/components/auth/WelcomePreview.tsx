import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function WelcomePreview() {
  return (
    <div className="mt-10 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to TechSupport</h2>
        <p className="text-muted-foreground">
          Your comprehensive tech resource center for hardware and software support.
        </p>
      </div>
      
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-4 text-center">Available Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    <span>Windows Installation Guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    <span>Driver Downloads & Updates</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    <span>Hardware Troubleshooting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    <span>Diagnostic Tools</span>
                  </li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    <span>Disassembly Guides for Repairs</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}