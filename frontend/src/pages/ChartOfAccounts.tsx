import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Plus, ArrowUpRight, ArrowDownLeft, Network, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const ChartOfAccounts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
      gl_code: '',
      name: '',
      currency: 'NGN',
      gl_type: 'ASSET',
      parent_gl_code: '',
      is_control_account: false
  });

  const { data: coa, isLoading, refetch } = useQuery({
    queryKey: ['chartOfAccounts'],
    queryFn: () => apiClient('/corebanking/gl/coa'),
  });

  const createGLMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/gl/accounts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('GL Account created successfully.');
      setIsCreating(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Creation failed'),
  });

  const handleCreate = () => {
      createGLMutation.mutate(formData);
  };

  const renderGLList = (items: any[], typeName: string, icon: React.ReactNode, total: number) => (
      <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden mb-6">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                      {icon}
                  </div>
                  <div>
                      <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-800">{typeName}</CardTitle>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{items?.length || 0} Sub-accounts active</p>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Class Total</p>
                  <p className="text-xl font-mono font-black text-slate-900">₦{parseFloat(total?.toString() || '0').toLocaleString()}</p>
              </div>
          </CardHeader>
          <CardContent className="p-0">
             {items?.length > 0 ? (
                 <div className="divide-y divide-slate-50">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{item.name}</p>
                                    {item.is_control_account && <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 text-[8px] font-black uppercase tracking-widest">CONTROL ACC</Badge>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-mono text-[9px]">{item.gl_code}</Badge>
                                    {item.parent_gl_code && <span className="text-[9px] text-slate-400 font-medium">Sub of {item.parent_gl_code}</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 font-mono tracking-widest">₦{parseFloat(item.current_balance).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                 </div>
             ) : (
                 <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No GL accounts found in this class</div>
             )}
          </CardContent>
      </Card>
  );

  if (isLoading) return <Layout><div className="p-10 text-center font-bold text-slate-400">Loading Chart of Accounts...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                FINANCIAL LEDGER <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><BookOpen className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Chart of Accounts & System Trial Balance.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Add GL Node
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl ring-1 ring-emerald-500/20 rounded-[32px] bg-emerald-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ArrowDownLeft className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10 p-8">
                    <CardTitle className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Total System Assets</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter drop-shadow-md">
                        ₦{parseFloat(coa?.total_assets || 0).toLocaleString()}
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-xl ring-1 ring-rose-500/20 rounded-[32px] bg-rose-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10 p-8">
                    <CardTitle className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Total Liabilities</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter drop-shadow-md">
                        ₦{parseFloat(coa?.total_liabilities || 0).toLocaleString()}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-2">
            {renderGLList(coa?.assets, 'Assets', <ArrowDownLeft className="h-5 w-5" />, coa?.total_assets)}
            {renderGLList(coa?.liabilities, 'Liabilities', <ArrowUpRight className="h-5 w-5" />, coa?.total_liabilities)}
            {renderGLList(coa?.equity, 'Equity', <ShieldCheck className="h-5 w-5" />, 0)}
            {renderGLList(coa?.income, 'Income', <Activity className="h-5 w-5" />, 0)}
            {renderGLList(coa?.expenses, 'Expenses', <AlertTriangle className="h-5 w-5" />, 0)}
        </div>

        {/* Create GL Modal */}
        {isCreating && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Network className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Add GL Node</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Extend the Chart of Accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GL Code</Label>
                                <Input placeholder="e.g. 100001" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.gl_code} onChange={e => setFormData({...formData, gl_code: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GL Name</Label>
                                <Input placeholder="e.g. Cash in Vault" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GL Type</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={formData.gl_type}
                                    onChange={(e) => setFormData({...formData, gl_type: e.target.value})}
                                >
                                    <option value="ASSET">Asset</option>
                                    <option value="LIABILITY">Liability</option>
                                    <option value="EQUITY">Equity</option>
                                    <option value="INCOME">Income</option>
                                    <option value="EXPENSE">Expense</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 mt-4 px-2">
                                <input 
                                    type="checkbox" 
                                    id="control_acc" 
                                    className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={formData.is_control_account}
                                    onChange={e => setFormData({...formData, is_control_account: e.target.checked})}
                                />
                                <Label htmlFor="control_acc" className="text-xs font-bold text-slate-700">Is Control Account (for sub-ledgers)</Label>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handleCreate} disabled={createGLMutation.isPending}>
                            {createGLMutation.isPending ? 'Provisioning...' : 'Provision GL'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default ChartOfAccounts;
