import React from 'react';
import Layout from '@/components/Layout';
import TreasuryDashboard from '@/components/TreasuryDashboard';

const TreasuryPage = () => {
  return (
    <Layout>
      <div className="p-8">
        <TreasuryDashboard />
      </div>
    </Layout>
  );
};

export default TreasuryPage;
