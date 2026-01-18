import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send } from "lucide-react";

export default function AdminSendMoney() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (user?.email !== 'aa.web.dev9777@gmail.com') return [];
      return await base44.asServiceRole.entities.User.list();
    },
  });

  const sendMoneyMutation = useMutation({
    mutationFn: async ({ recipientEmail, amount: transferAmount }) => {
      await base44.functions.invoke('transferMoney', { 
        recipientEmail, 
        amount: transferAmount 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAccounts'] });
      setAmount('');
      setSelectedUser(null);
      setSearchQuery('');
    },
  });

  const filteredUsers = allUsers.filter(user =>
    user.email !== 'aa.web.dev9777@gmail.com' && (
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSend = () => {
    if (amount && parseFloat(amount) > 0 && selectedUser) {
      sendMoneyMutation.mutate({ 
        recipientEmail: selectedUser.email, 
        amount: parseFloat(amount) 
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search user by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchQuery && filteredUsers.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
          {filteredUsers.slice(0, 5).map((user) => (
            <button
              key={user.email}
              onClick={() => {
                setSelectedUser(user);
                setSearchQuery('');
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedUser?.email === user.email
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-violet-300'
              }`}
            >
              <p className="font-medium text-sm">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </button>
          ))}
        </div>
      )}

      {searchQuery && filteredUsers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-3">No users found</p>
      )}

      {selectedUser && (
        <div className="space-y-3 pt-2 border-t">
          <div className="p-3 bg-violet-50 rounded-lg">
            <p className="text-sm text-gray-600">Sending to:</p>
            <p className="font-medium">{selectedUser.full_name}</p>
            <p className="text-xs text-gray-500">{selectedUser.email}</p>
          </div>
          <Input
            type="number"
            placeholder="Amount (£)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <Button
            onClick={handleSend}
            disabled={!amount || parseFloat(amount) <= 0 || sendMoneyMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send £{amount || '0'}
          </Button>
          {sendMoneyMutation.isSuccess && (
            <p className="text-sm text-green-600">✓ Money sent successfully</p>
          )}
        </div>
      )}
    </div>
  );
}