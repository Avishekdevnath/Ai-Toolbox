'use client';

import { useState } from 'react';
import { ModuleCard } from './components/ModuleCard';
import { financeModules } from './config/modules';
import { BaseModuleProps } from './types';
import { FinanceProvider } from './context/FinanceContext';
import { LoadingOverlay } from './components/LoadingOverlay';
import { CurrencySelector } from './components/CurrencySelector';

// Import all module components
import GeneralFinancialHealth from './modules/GeneralFinancialHealth';
import InvestmentPlanning from './modules/InvestmentPlanning';
import RetirementPlanning from './modules/RetirementPlanning';
import DebtManagement from './modules/DebtManagement';
import EmergencyFund from './modules/EmergencyFund';

const moduleComponents: { [key: string]: React.ComponentType<BaseModuleProps> } = {
  'general-health': GeneralFinancialHealth,
  'investment-planning': InvestmentPlanning,
  'retirement-planning': RetirementPlanning,
  'debt-management': DebtManagement,
  'emergency-fund': EmergencyFund,
};

interface Props {
  onBack: () => void;
}

export default function FinanceAdvisorTool({ onBack }: Props) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleModuleSelect = (moduleId: string) => {
    const module = financeModules.find(m => m.id === moduleId);
    if (module?.status === 'Available' || module?.status === 'Beta') {
      setSelectedModule(moduleId);
    }
  };

  const handleBackToHub = () => {
    setSelectedModule(null);
  };

  // Categorize modules
  const essentialModules = financeModules.filter(m => 
    ['general-health', 'emergency-fund'].includes(m.id)
  );
  
  const wealthBuildingModules = financeModules.filter(m => 
    ['investment-planning', 'retirement-planning'].includes(m.id)
  );
  
  const financialManagementModules = financeModules.filter(m => 
    ['debt-management', 'tax-planning'].includes(m.id)
  );
  
  const protectionModules = financeModules.filter(m => 
    ['insurance-analysis', 'estate-planning'].includes(m.id)
  );
  
  const comingSoonModules = financeModules.filter(m => 
    m.status === 'Coming Soon'
  );

  return (
    <FinanceProvider>
      <LoadingOverlay />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Financial Advisory Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a module to start your financial planning journey
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CurrencySelector />
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              ← Back to Tools
            </button>
          </div>
        </div>

        {selectedModule ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {(() => {
              const SelectedComponent = moduleComponents[selectedModule];
              return <SelectedComponent onBack={handleBackToHub} />;
            })()}
          </div>
        ) : (
          <>
            {/* Module Categories */}
            <div className="space-y-8">
              {/* Essential Planning */}
              {essentialModules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🎯 Essential Planning
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {essentialModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        {...module}
                        onClick={() => handleModuleSelect(module.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Wealth Building */}
              {wealthBuildingModules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📈 Wealth Building
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wealthBuildingModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        {...module}
                        onClick={() => handleModuleSelect(module.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Management */}
              {financialManagementModules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    💰 Financial Management
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {financialManagementModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        {...module}
                        onClick={() => handleModuleSelect(module.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Protection & Planning */}
              {protectionModules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🛡️ Protection & Planning
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {protectionModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        {...module}
                        onClick={() => handleModuleSelect(module.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Coming Soon */}
              {comingSoonModules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🚀 Coming Soon
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comingSoonModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        {...module}
                        onClick={() => handleModuleSelect(module.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                Quick Tips for Financial Success
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h4 className="font-medium mb-2">Start with Basics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Begin with the General Financial Health assessment to get a comprehensive overview
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h4 className="font-medium mb-2">Emergency First</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Build your emergency fund before focusing on other financial goals
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h4 className="font-medium mb-2">Regular Reviews</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review and update your financial plan every 3-6 months
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </FinanceProvider>
  );
}