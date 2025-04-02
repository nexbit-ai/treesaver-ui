import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestCaseResult {
  testCaseName: string;
  result: 'pass' | 'fail';
  files: string;
}

interface TestCaseResultsProps {
  results: TestCaseResult[];
}

const TestCaseResults: React.FC<TestCaseResultsProps> = ({ results }) => {
  return (
    <div className="space-y-2">
      {results.map((result, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            {result.result === 'pass' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">{result.testCaseName}</p>
              {result.files && (
                <p className="text-sm text-muted-foreground">
                  Failed files: {result.files}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              result.result === 'pass'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {result.result.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TestCaseResults; 