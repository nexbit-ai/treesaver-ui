
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold mb-4">Audit PBC Tool</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Streamlining document requests between CAs and clients
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {isAuthenticated ? (
            <>
              <Link to={role === 'cpa' ? '/cpa-dashboard' : '/dashboard'}>
                <Button size="lg" className="w-full">
                  Go to {role === 'cpa' ? 'CPA' : 'Client'} Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full">
                  Client Portal
                </Button>
              </Link>
              <Link to="/cpa-dashboard">
                <Button size="lg" className="w-full">
                  Auditor Portal
                </Button>
              </Link>
            </>
          )}
        </div>
        
        <div className="mt-12 text-muted-foreground">
          <p>A comprehensive solution for managing audit documentation requests</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
