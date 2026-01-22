import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';

export default function ImpersonateUser() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImpersonate = async () => {
    if (!email.trim()) {
      setError('Enter user email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('impersonateUser', { targetEmail: email });
      
      if (response.data?.token) {
        // Use token for login, then remove it from URL after redirect
        const hashToken = `#token=${response.data.token}`;
        window.location.href = `/${hashToken}`;
      }
    } catch (err) {
      setError(err.message || 'Impersonation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <Input
          placeholder="user@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleImpersonate()}
          disabled={loading}
        />
        <Button
          onClick={handleImpersonate}
          disabled={loading}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Logging in...' : 'Impersonate User'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}