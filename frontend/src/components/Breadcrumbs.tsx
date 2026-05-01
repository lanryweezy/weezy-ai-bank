
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-gray-500 mb-6">
      <Link to="/" className="hover:text-indigo-600 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            {last ? (
              <span className="text-gray-900 font-bold capitalize">
                {value.replace(/-/g, ' ')}
              </span>
            ) : (
              <Link to={to} className="hover:text-indigo-600 transition-colors capitalize">
                {value.replace(/-/g, ' ')}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
