import React from 'react';
import Layout from '@/components/Layout';
import AIInsightsDashboard from '@/components/AIInsightsDashboard';

const AIInsightsPage = () => {
  return (
    <Layout>
      <div className="p-8">
        <AIInsightsDashboard />
      </div>
    </Layout>
  );
};

export default AIInsightsPage;
