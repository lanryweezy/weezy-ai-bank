import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ShieldCheck, Download, Eye, Clock, Search, Filter, History, Award, Landmark, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';

const DocumentVault = () => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: () => [
        { id: 1, name: 'Certificate of Investment', type: 'CERTIFICATE', ref: 'WZY-FD-9920', date: '2026-04-12', status: 'VERIFIED', size: '1.2 MB' },
        { id: 2, name: 'Tier 3 KYC Approval', type: 'LEGAL', ref: 'KYC-8821', date: '2026-03-01', status: 'VERIFIED', size: '420 KB' },
        { id: 3, name: 'Mortgage Offer Letter', type: 'AGREEMENT', ref: 'LN-OFF-442', date: '2026-04-28', status: 'PENDING_SIGN', size: '2.4 MB' },
        { id: 4, name: 'Annual Tax Statement (2025)', type: 'TAX', ref: 'TAX-2025', date: '2026-01-15', status: 'VERIFIED', size: '850 KB' }
    ],
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'CERTIFICATE': return <Award className="h-6 w-6 text-indigo-600" />;
      case 'AGREEMENT': return <FileText className="h-6 w-6 text-blue-600" />;
      case 'LEGAL': return <ShieldCheck className="h-6 w-6 text-emerald-600" />;
      default: return <FileText className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
                DOCUMENT VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><FileText className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Immutable Storage for Certified Instruments & Agreements.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Filter className="mr-2 h-4 w-4" /> Filter Vault
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Stored Items', value: '14', icon: FileText, color: 'indigo' },
                { label: 'Signed Docs', value: '12', icon: ShieldCheck, color: 'emerald' },
                { label: 'Pending Sign', value: '2', icon: Clock, color: 'amber' },
                { label: 'Storage Used', value: '42 MB', icon: Landmark, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                    <CardContent className="p-8">
                        <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 w-fit mb-4 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Certified Records</h3>
            <div className="space-y-4">
                {documents?.map((doc) => (
                    <Card key={doc.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[28px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-[20px] bg-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {getIcon(doc.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-black text-slate-900 text-sm tracking-tight uppercase">{doc.name}</p>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-mono text-[8px] uppercase">{doc.ref}</Badge>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <History className="h-3 w-3 text-indigo-400" /> Issued: {format(new Date(doc.date), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <FileText className="h-3 w-3 text-indigo-400" /> Size: {doc.size}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className={`border-none font-black text-[8px] px-3 py-1 uppercase tracking-widest ${doc.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'}`}>
                                    {doc.status.replace('_', ' ')}
                                </Badge>
                                <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                                    <Eye className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                                    <Download className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
            <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[40px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                <div className="p-10 relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="bg-white/10 w-16 h-16 rounded-[24px] flex items-center justify-center backdrop-blur-md rotate-3 shadow-2xl">
                         <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase">Neural Signing Core</CardTitle>
                    <p className="text-xs text-slate-400 leading-relaxed italic max-w-xs font-medium">
                        "Every document in this vault is cryptographically signed by the Weezy Prime core. Any attempt to modify the underlying data will invalidate the instrument's hash."
                    </p>
                    <Button className="bg-white text-slate-900 rounded-xl px-8 h-12 font-black text-[10px] uppercase tracking-widest border-none hover:bg-indigo-50 transition-all">
                        Validate Certificate
                    </Button>
                </div>
            </Card>

            <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Landmark className="h-32 w-32 text-indigo-600" />
                 </div>
                 <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em] mb-4">Vault Protocol</h4>
                 <p className="text-sm text-indigo-900 font-bold leading-relaxed italic relative z-10">
                    "This vault is synchronized with the CBN National Document Registry for legal parity in Nigerian Courts."
                 </p>
                 <Button variant="link" className="p-0 h-auto mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:no-underline flex items-center gap-2">
                    Open Legal Framework <ExternalLink className="h-3 w-3" />
                 </Button>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentVault;
