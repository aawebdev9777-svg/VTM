import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sheet() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await base44.auth.me();
      if (user?.email === 'aa.web.dev9777@gmail.com') {
        navigate(createPageUrl('Home'));
      }
    };
    checkUser();
  }, [navigate]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await base44.functions.invoke('exportTradesGoogleSheets', {
        dateRange
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <FileSpreadsheet className="w-10 h-10 text-blue-600" />
          Export Trades
        </h1>
        <p className="text-gray-600">Export your trading history to Google Sheets</p>
      </motion.div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <div className="flex gap-3">
              <button
                onClick={() => setDateRange('today')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  dateRange === 'today'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Today Only
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                  dateRange === 'all'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Export to Google Sheets
              </>
            )}
          </Button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3"
            >
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                Export Successful!
              </div>
              <p className="text-sm text-green-600">
                {result.transactionCount} transactions exported
              </p>
              <a
                href={result.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Sheets
              </a>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}