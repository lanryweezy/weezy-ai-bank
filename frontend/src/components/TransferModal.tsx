import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Landmark, User, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useQuery, useMutation } from '@tanstack/react-query';

interface Bank {
  name: string;
  code: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [debitAccount, setDebitAccount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: myAccounts, isLoading: loadingAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
    enabled: isOpen,
  });

  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['banks'],
    queryFn: () => apiClient('/integrations/banks'),
    enabled: isOpen,
  });

  const nameEnquiryMutation = useMutation({
    mutationFn: (data: { bank_code: string, account_number: string }) => 
      apiClient('/integrations/nip/name-enquiry', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setAccountName(data.account_name);
      setStep(2);
      setError(null);
    },
    onError: (err: any) => setError(err.message || 'Could not verify account'),
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => 
      apiClient('/transactions/initiate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      setStep(3);
      onSuccess();
    },
    onError: (err: any) => setError(err.message || 'Transfer failed'),
  });

  const handleNext = () => {
    if (!bankCode || accountNumber.length !== 10) {
      setError('Please select a bank and enter a 10-digit account number.');
      return;
    }
    nameEnquiryMutation.mutate({ bank_code: bankCode, account_number: accountNumber });
  };

  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0 || !debitAccount) {
        setError('Please select a source account and enter a valid amount.');
        return;
    }
    transferMutation.mutate({
      transaction_type: 'TRANSFER',
      channel: 'MOBILE_APP',
      amount: parseFloat(amount),
      currency: 'NGN',
      debit_account_number: debitAccount,
      credit_account_number: accountNumber,
      credit_account_name: accountName,
      credit_bank_code: bankCode,
      narration: narration || `TRF to ${accountName}`
    });
  };

  const reset = () => {
    setStep(1);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setAmount('');
    setNarration('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { onClose(); reset(); } }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-600">
            <Landmark className="h-5 w-5" /> 
            {step === 3 ? 'Transfer Successful' : 'Transfer Money (NIP)'}
          </DialogTitle>
          <DialogDescription>
            Inter-bank and Intra-bank transfers across Nigeria.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Account</Label>
              <Select onValueChange={setDebitAccount} value={debitAccount}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select account to debit" />
                </SelectTrigger>
                <SelectContent>
                  {myAccounts?.map((acc) => (
                    <SelectItem key={acc.account_number} value={acc.account_number}>
                      {acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination Bank</Label>
              <Select onValueChange={setBankCode} value={bankCode}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks?.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Beneficiary NUBAN</Label>
              <Input 
                placeholder="0123456789" 
                maxLength={10} 
                value={accountNumber}
                className="h-12 rounded-xl"
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                <User className="h-4 w-4" /> {accountName}
              </div>
              <p className="text-[10px] text-indigo-400 mt-1">Verified Beneficiary</p>
            </div>
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input 
                type="number" 
                placeholder="5,000.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Narration</Label>
              <Input 
                placeholder="Payment for services" 
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold">Transaction Sent</h4>
              <p className="text-gray-500 text-sm mt-1">₦{parseFloat(amount).toLocaleString()} to {accountName}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button onClick={handleNext} disabled={nameEnquiryMutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {nameEnquiryMutation.isPending ? <Activity className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify Account
            </Button>
          )}
          {step === 2 && (
            <div className="flex w-full gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleTransfer} disabled={transferMutation.isPending} className="flex-[2] bg-indigo-600 hover:bg-indigo-700">
                    {transferMutation.isPending ? <Activity className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Transfer
                </Button>
            </div>
          )}
          {step === 3 && (
            <Button onClick={() => { onClose(); reset(); }} className="w-full bg-indigo-600 hover:bg-indigo-700">Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
