import React from 'react';
import Layout from '@/components/Layout';
import ConsentManager from '@/components/ConsentManager';

const OpenBankingPage = () => {
  return (
    <Layout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Open Banking Consent Manager</h2>
          <p className="text-gray-500 mt-1">Manage third-party access to your account data according to PSD2 standards.</p>
        </div>

        {/* For demo, we use a constant account ID */}
        <ConsentManager accountId="1029384756" />
      </div>
    </Layout>
  );
};

export default OpenBankingPage;
