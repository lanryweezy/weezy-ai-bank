import React from 'react';
import Layout from '@/components/Layout';
import MakerCheckerQueue from '@/components/MakerCheckerQueue';

const MakerCheckerPage = () => {
  return (
    <Layout>
      <div className="p-8">
        <MakerCheckerQueue />
      </div>
    </Layout>
  );
};

export default MakerCheckerPage;
