import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut,
  User,
  FileSpreadsheet
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-semibold tracking-tight">Document Portal</h1>
            <p className="text-muted-foreground">Upload and manage your documents</p>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/excel-mapper">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Mapper
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden md:inline-block">Welcome, {user?.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
