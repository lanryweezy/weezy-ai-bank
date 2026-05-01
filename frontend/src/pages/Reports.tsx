import React from 'react';
import Layout from '@/components/Layout';
import FinancialReportCenter from '@/components/FinancialReportCenter';

const ReportsPage = () => {
  return (
    <Layout>
      <div className="p-8">
        <FinancialReportCenter />
      </div>
    </Layout>
  );
};

export default ReportsPage;
