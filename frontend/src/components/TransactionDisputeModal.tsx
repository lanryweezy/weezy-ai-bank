import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

interface TransactionDisputeModalProps {
  transactionId: string;
  onClose: () => void;
}

const TransactionDisputeModal: React.FC<TransactionDisputeModalProps> = ({ transactionId, onClose }) => {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const disputeMutation = useMutation({
    mutationFn: (data: { transactionId: string, reason: string }) => 
      apiClient(`/transactions/${data.transactionId}/dispute`, { method: 'POST', body: JSON.stringify({ reason: data.reason }) }),
    onSuccess: () => {
      toast.success('Dispute logged successfully. Case ID generated.');
      queryClient.invalidateQueries({ queryKey: ['walletTxns'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || 'Dispute failed'),
  });

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="bg-rose-600 text-white p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                    <AlertTriangle className="h-20 w-20" />
                </div>
                <CardTitle className="text-3xl font-black italic tracking-tighter">DISPUTE CENTER</CardTitle>
                <CardDescription className="text-rose-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Transaction Resolution Protocol</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference ID</Label>
                        <Input value={transactionId} readOnly className="h-12 rounded-xl bg-slate-50 border-none px-4 font-mono text-xs font-bold text-slate-500" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Dispute</Label>
                        <select 
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-rose-600/20 transition-all"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        >
                            <option value="">Select a reason...</option>
                            <option value="UNAUTHORIZED">Unauthorized Transaction</option>
                            <option value="WRONG_AMOUNT">Incorrect Amount Debited</option>
                            <option value="NOT_RECEIVED">Beneficiary Not Received</option>
                            <option value="DUPLICATE">Duplicate Debit</option>
                            <option value="OTHER">Others</option>
                        </select>
                    </div>
                </div>
                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                    <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0" />
                    <p className="text-[10px] text-indigo-800 leading-relaxed font-medium italic">
                        Our fraud engine will review this case within 24 hours. You will receive an SMS update once a resolution is reached.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-3">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
                <Button 
                    className="flex-[2] bg-rose-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100 border-none active:scale-95 transition-all" 
                    onClick={() => disputeMutation.mutate({ transactionId, reason })}
                    disabled={disputeMutation.isPending || !reason}
                >
                    {disputeMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Log Dispute'}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
};

export default TransactionDisputeModal;
