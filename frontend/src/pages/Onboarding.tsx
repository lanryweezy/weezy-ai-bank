import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import TieredOnboarding from '@/components/TieredOnboarding';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would come from auth context or query param
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // For demo purposes, we might need a fallback if userId is not customerId
      setCustomerId(user.customer_id || user.userId);
    }
  }, []);

  return (
    <Layout>
      <div className="p-8">
        {customerId ? (
          <TieredOnboarding
            customerId={customerId}
            onComplete={() => navigate('/dashboard')}
          />
        ) : (
          <div className="p-12 text-center bg-rose-50 rounded-2xl border border-rose-100">
            <p className="text-rose-800 font-bold">Customer Profile Not Found</p>
            <p className="text-rose-600 text-sm mt-1">Please ensure you are logged in correctly.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OnboardingPage;
