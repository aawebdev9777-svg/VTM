import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [deleting, setDeleting] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ['userAccount'],
    queryFn: () => base44.entities.UserAccount.list(),
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list(),
  });

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete all user data
      for (const item of portfolio) {
        await base44.entities.Portfolio.delete(item.id);
      }
      for (const item of transactions) {
        await base44.entities.Transaction.delete(item.id);
      }
      for (const item of accounts) {
        await base44.entities.UserAccount.delete(item.id);
      }

      // Logout after deletion
      setTimeout(() => {
        base44.auth.logout();
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleting(false);
    }
  };

  const account = accounts?.[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-violet-600" />
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your trading account
        </p>
      </motion.div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your trading account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cash Balance</span>
              <span className="font-semibold">£{account?.cash_balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Holdings</span>
              <span className="font-semibold">{portfolio.length} stocks</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total Trades</span>
              <span className="font-semibold">{transactions.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Permanently delete your trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This action cannot be undone. All your portfolio, transactions, and account data will be permanently deleted.
              </AlertDescription>
            </Alert>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your trading account, including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All portfolio holdings ({portfolio.length} stocks)</li>
                      <li>Transaction history ({transactions.length} trades)</li>
                      <li>Account balance (£{account?.cash_balance?.toFixed(2) || '0.00'})</li>
                    </ul>
                    <p className="mt-2 font-semibold">This action cannot be undone.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}