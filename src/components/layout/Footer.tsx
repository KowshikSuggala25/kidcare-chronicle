import React from "react";
import { Github, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 KidCare Chronicle. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/KowshikSuggala25"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Contact Developer on GitHub"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </a>

            <a
              href="mailto:saikowshiksuggala9390@gmail.com"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Contact Developer via Email"
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
