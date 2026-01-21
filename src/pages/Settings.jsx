import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle, User, RotateCcw, DollarSign } from 'lucide-react';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [currency, setCurrency] = useState('GBP');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((user) => {
      setCurrentUser(user);
      setCurrency(user?.currency || 'GBP');
    });
  }, []);

  const { data: accounts = [] } = useQuery({
    queryKey: ['userAccount', currentUser?.email],
    queryFn: () => base44.entities.UserAccount.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', currentUser?.email],
    queryFn: () => base44.entities.Portfolio.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', currentUser?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: currentUser?.email }),
    enabled: !!currentUser?.email,
  });

  const resetDataMutation = useMutation({
    mutationFn: () => base44.functions.invoke('resetMyData', {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      for (const item of portfolio) {
        await base44.entities.Portfolio.delete(item.id);
      }
      for (const item of transactions) {
        await base44.entities.Transaction.delete(item.id);
      }
      for (const item of accounts) {
        await base44.entities.UserAccount.delete(item.id);
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        base44.auth.logout();
      }, 1000);
    },
  });

  const currencyMutation = useMutation({
    mutationFn: (newCurrency) => base44.auth.updateMe({ currency: newCurrency }),
    onSuccess: (data) => {
      setCurrency(data.currency);
      queryClient.invalidateQueries();
    },
  });

  const handleCurrencyToggle = (checked) => {
    const newCurrency = checked ? 'USD' : 'GBP';
    currencyMutation.mutate(newCurrency);
  };

  const account = accounts?.[0];
  const currencySymbol = currency === 'USD' ? '$' : '£';

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
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-violet-600" />
              Currency Preference
            </CardTitle>
            <CardDescription>Choose your preferred currency display</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Label htmlFor="currency-switch" className="text-base font-medium cursor-pointer">
                  {currency === 'GBP' ? '£ British Pound (GBP)' : '$ US Dollar (USD)'}
                </Label>
              </div>
              <Switch
                id="currency-switch"
                checked={currency === 'USD'}
                onCheckedChange={handleCurrencyToggle}
                disabled={currencyMutation.isPending}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              All prices will be converted and displayed in {currency}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your trading account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cash Balance</span>
              <span className="font-semibold">{currencySymbol}{account?.cash_balance?.toFixed(2) || '0.00'}</span>
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

        <Card className="border-0 shadow-lg border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Reset Account
            </CardTitle>
            <CardDescription>Start fresh with £10,000</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                This will delete all your trading data and reset your balance to £10,000.
              </AlertDescription>
            </Alert>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                  disabled={resetDataMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {resetDataMutation.isPending ? 'Resetting...' : 'Reset My Data'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset your trading account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All portfolio holdings ({portfolio.length} stocks)</li>
                      <li>Transaction history ({transactions.length} trades)</li>
                      <li>Watchlist and alerts</li>
                    </ul>
                    <p className="mt-2 font-semibold">Your balance will reset to £10,000</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => resetDataMutation.mutate()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Yes, Reset Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {resetDataMutation.isSuccess && (
              <p className="text-sm text-green-600 mt-3 text-center">✓ Account reset successfully!</p>
            )}
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
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  disabled={deleteAccountMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
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
                    onClick={() => deleteAccountMutation.mutate()}
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