import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X, Building2, ShieldCheck, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface StatementModalProps {
  customerName: string;
  accountNumber: string;
  transactions: any[];
  balance: string;
  onClose: () => void;
}

const StatementModal: React.FC<StatementModalProps> = ({ customerName, accountNumber, transactions, balance, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto">
        <Card className="w-full max-w-4xl border-none shadow-2xl bg-white rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white border-b border-slate-100 p-8 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-xl">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">ACCOUNT STATEMENT</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weezy AI Banking Group</p>
                    </div>
                </div>
                <div className="flex gap-3 no-print">
                    <Button variant="outline" className="rounded-xl h-10 px-4 border-slate-200 font-black text-[10px] uppercase tracking-widest" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 rounded-xl" onClick={onClose}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="p-12 space-y-12">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-slate-100 pb-12">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{customerName.toUpperCase()}</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                <p className="text-xl font-mono font-black text-indigo-600 tracking-[0.2em]">{accountNumber}</p>
                            </div>
                        </div>
                        <div className="text-right space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement Period</p>
                                <p className="text-sm font-bold text-slate-700 uppercase">Current Month-to-Date</p>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-[32px] text-white inline-block">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Closing Balance</p>
                                <h4 className="text-3xl font-black tracking-tighter italic">₦{parseFloat(balance).toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ledger</h3>
                        <div className="rounded-[32px] border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Narration</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {transactions.map((t, i) => (
                                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{format(new Date(t.initiated_at), 'dd MMM yyyy')}</td>
                                            <td className="px-6 py-4 text-xs font-black text-slate-900 tracking-tight">{t.narration || 'System Posting'}</td>
                                            <td className="px-6 py-4 text-[10px] font-mono font-bold text-slate-400 uppercase">{t.id.slice(-8)}</td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-rose-600">
                                                {t.transaction_type === 'TRANSFER' || t.transaction_type === 'WITHDRAWAL' ? `₦${parseFloat(t.amount).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">
                                                {t.transaction_type === 'DEPOSIT' || t.transaction_type === 'REFUND' ? `₦${parseFloat(t.amount).toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer / Cert */}
                    <div className="flex justify-between items-center pt-10 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified Digital Copy • No signature required</p>
                        </div>
                        <p className="text-[9px] text-slate-300 font-mono italic">Generated by Weezy AI Prime Core on {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50/50 p-8 border-t border-slate-100 flex justify-center no-print">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic text-center">
                    Member of NDIC • Licensed by CBN
                </p>
            </CardFooter>
        </Card>
    </div>
  );
};

export default StatementModal;
