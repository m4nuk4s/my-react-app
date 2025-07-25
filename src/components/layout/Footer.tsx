import { EnhancedThemeToggle } from "@/components/ui/enhanced-theme-toggle";

export default function Footer() {
  return (
    <footer className="mt-auto py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tech Support Guide
          </div>
          <div className="fixed bottom-4 left-8 z-[100]">
            <EnhancedThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}