import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const statusBadge = (status) => {
  const map = {
    Completed: 'bg-green-800 text-green-200',
    Pending: 'bg-yellow-800 text-yellow-200',
    Cancelled: 'bg-red-800 text-red-200',
  };
  return `text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-700 text-gray-300'}`;
};

const Transfers = () => {
  const { transfers, fetchTransfers, loading, error } = useApp();

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Transfer History</h2>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-red-400 text-sm">Error: {error}</p>}

      {!loading && !error && transfers.length === 0 && (
        <p className="text-gray-500 text-sm">No transfers recorded yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {transfers.map((t) => (
          <div key={t._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-white">
                {t.foodItemId?.name ?? 'Unknown Item'}{' '}
                <span className="text-gray-400 font-mono text-xs">({t.foodItemId?.sku})</span>
              </span>
              <span className={statusBadge(t.status)}>{t.status}</span>
            </div>
            <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
              <span>From</span>
              <span className="text-gray-200">{t.sourceStoreId?.storeName ?? '—'}</span>
              <span>To</span>
              <span className="text-gray-200">{t.destinationStoreId?.storeName ?? '—'}</span>
              <span>Quantity</span>
              <span className="text-gray-200">{t.quantity} units</span>
              <span>Date</span>
              <span className="text-gray-200">{new Date(t.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transfers;
