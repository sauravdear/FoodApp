import { useState } from 'react';
import StockAlerts from '../components/dashboard/StockAlerts';
import TransferPanel from '../components/dashboard/TransferPanel';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const { recommendations } = useApp();
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6 flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Stock Alerts</h2>
          <span className="text-xs bg-red-800 text-red-200 px-2 py-1 rounded-full">
            {recommendations.length} alert(s)
          </span>
        </div>
        <StockAlerts />

        {recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm text-gray-400 mb-2">Select an alert to approve a transfer:</h3>
            <div className="flex flex-col gap-2">
              {recommendations.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelected(rec)}
                  className={`text-left text-xs px-3 py-2 rounded border transition-colors ${
                    selected === rec
                      ? 'border-emerald-500 bg-emerald-900 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {rec.reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-80 shrink-0">
        <h2 className="text-xl font-bold text-white mb-4">Transfer Panel</h2>
        {selected ? (
          <TransferPanel recommendation={selected} onSuccess={() => setSelected(null)} />
        ) : (
          <p className="text-gray-500 text-sm">Select an alert on the left to approve a transfer.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
