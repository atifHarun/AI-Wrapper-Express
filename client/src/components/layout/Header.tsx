import { Sparkles } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
        >
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            Nexus AI
          </span>
        </Link>
        <div className="text-sm font-medium text-muted-foreground hidden sm:block">
          Analysis Engine
        </div>
      </div>
    </header>
  );
}
