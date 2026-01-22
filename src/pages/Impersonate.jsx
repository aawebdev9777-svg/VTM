import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Impersonate() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [impersonateLoading, setImpersonateLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.email === 'aa.web.dev9777@gmail.com');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const handleImpersonate = async () => {
    if (!email.trim()) {
      setError('Enter user email');
      return;
    }

    setImpersonateLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('impersonateUser', { targetEmail: email });
      
      if (response.data?.token) {
        const hashToken = `#token=${response.data.token}`;
        window.location.href = `/${hashToken}`;
      }
    } catch (err) {
      setError(err.message || 'Impersonation failed');
    } finally {
      setImpersonateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <LogIn className="w-8 h-8 text-violet-600" />
          Impersonate User
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Log in as another user to test and manage their account
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Enter User Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="user@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleImpersonate()}
                disabled={impersonateLoading}
                className="text-base"
              />
              <Button
                onClick={handleImpersonate}
                disabled={impersonateLoading}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <LogIn className="w-4 h-4" />
                {impersonateLoading ? 'Logging in...' : 'Impersonate User'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}