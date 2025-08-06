
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  FileText,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-primary mb-6">
            Document Management Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Streamlined document management and audit collaboration platform for auditors and auditees. 
            Secure, efficient, and transparent document sharing and review process.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-2 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Enterprise-grade security with audit trails and compliance features for sensitive financial documents.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Live updates and notifications keep all stakeholders informed throughout the audit process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Streamlined Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Automated request tracking, approval workflows, and document version control for efficient audits.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-8 text-primary">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              <Link to="/cpa-dashboard">
                <Users className="h-6 w-6 mr-3" />
                Auditor Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              <Link to="/dashboard">
                <Building className="h-6 w-6 mr-3" />
                Auditee Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Supporting multiple industries and audit types</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
