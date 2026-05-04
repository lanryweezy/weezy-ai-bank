import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Download, Printer, X, Landmark, Award, Calendar, Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface InvestmentCertificateModalProps {
  fd: any;
  customerName: string;
  onClose: () => void;
}

const InvestmentCertificateModal: React.FC<InvestmentCertificateModalProps> = ({ fd, customerName, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto">
        <Card className="w-full max-w-4xl border-none shadow-2xl bg-white rounded-[40px] overflow-hidden flex flex-col relative">
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-slate-400 hover:text-indigo-600 z-20 p-2 bg-slate-50 rounded-full transition-all no-print"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Certificate Header */}
            <div className="bg-[#0f172a] p-16 text-center relative overflow-hidden text-white border-b-8 border-indigo-600">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                    <div className="bg-white/10 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 backdrop-blur-md rotate-3 shadow-2xl ring-1 ring-white/20">
                         <Award className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">Certificate of Investment</h1>
                    <p className="text-indigo-300 font-black uppercase text-[10px] tracking-[0.4em]">Fixed Term Deposit Instrument • Weezy AI Bank</p>
                </div>
            </div>

            <CardContent className="p-16 space-y-16 bg-white relative">
                <div className="absolute top-20 right-20 opacity-5 rotate-12 pointer-events-none">
                    <Landmark className="h-96 w-96 text-slate-900" />
                </div>

                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                        This document serves as official certification that capital has been successfully provisioned within the Weezy Global Liquidity Vault under the following parameters:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-slate-100 py-16">
                    <div className="space-y-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Beneficiary</p>
                            <h4 className="text-2xl font-black text-slate-900">{customerName.toUpperCase()}</h4>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Principal Capital Sum</p>
                            <h4 className="text-4xl font-black text-indigo-600 tracking-tighter italic">₦{parseFloat(fd.principal_amount).toLocaleString()}</h4>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guaranteed Yield Rate</p>
                            <h4 className="text-2xl font-black text-slate-900">{fd.interest_rate_applied}% Per Annum</h4>
                        </div>
                    </div>
                    <div className="space-y-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certificate Reference</p>
                            <p className="text-xl font-mono font-black text-slate-900 tracking-[0.2em]">{fd.fd_account_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                                <p className="text-sm font-bold text-slate-700">{format(new Date(fd.booking_date), 'MMMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maturity Date</p>
                                <p className="text-sm font-bold text-slate-700">{format(new Date(fd.maturity_date), 'MMMM dd, yyyy')}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maturity Instruction</p>
                            <Badge className="bg-slate-900 text-white border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">
                                {fd.rollover_instruction.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
                             <ShieldCheck className="h-8 w-8 text-emerald-500" />
                             <div className="absolute inset-0 border border-emerald-500 rounded-full animate-ping opacity-20" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digital Authentication</p>
                            <p className="text-[9px] text-slate-400 font-medium">SIGNED & VERIFIED BY PRIMECORE ORCHESTRATOR</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="mb-4 h-12 w-48 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center opacity-40">
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Digital Seal</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Executive Management</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Weezy AI Banking Group</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-10 border-t border-slate-100 flex justify-between items-center no-print">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic max-w-md">
                    This certificate is a legal instrument. Member of NDIC. Regulated by the Central Bank of Nigeria.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest" onClick={handlePrint}>
                        <Printer className="mr-3 h-4 w-4" /> Print PDF
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-xl shadow-indigo-100">
                        <Download className="mr-3 h-4 w-4" /> Download
                    </Button>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
};

export default InvestmentCertificateModal;
