import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-6">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-4xl font-semibold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Page Not Found
        </h1>
        
        <p className="text-lg text-muted-foreground mb-10">
          The page you're looking for doesn't exist or has been moved to another coordinate.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md shadow-primary/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
