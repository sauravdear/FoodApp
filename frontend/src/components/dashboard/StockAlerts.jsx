import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const urgencyClass = (days) => {
  if (days <= 1) return 'bg-red-900 border-red-600 text-red-200';
  if (days <= 2) return 'bg-orange-900 border-orange-600 text-orange-200';
  return 'bg-yellow-900 border-yellow-600 text-yellow-200';
};

const StockAlerts = () => {
  const { recommendations, fetchRecommendations, loading, error } = useApp();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) return <p className="text-gray-400 text-sm">Analysing inventory...</p>;
  if (error) return <p className="text-red-400 text-sm">Error: {error}</p>;
  if (!recommendations.length)
    return <p className="text-green-400 text-sm">No urgent transfers needed right now.</p>;

  return (
    <div className="flex flex-col gap-3">
      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className={`border rounded-lg p-4 text-sm ${urgencyClass(rec.foodItem.daysUntilExpiry)}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold">{rec.foodItem.name}</span>
            <span className="text-xs font-mono opacity-75">SKU: {rec.foodItem.sku}</span>
          </div>
          <p className="text-xs mb-2 opacity-80">
            Expires in{' '}
            <strong>{rec.foodItem.daysUntilExpiry.toFixed(1)} day(s)</strong> &mdash; Batch{' '}
            {rec.foodItem.batchNumber}
          </p>
          <p className="text-xs">
            <strong>{rec.sourceStore.name}</strong>{' '}
            <span className="opacity-70">(velocity: {rec.sourceStore.salesVelocity} u/day, surplus: {rec.sourceStore.surplusUnits})</span>
            {' → '}
            <strong>{rec.destinationStore.name}</strong>{' '}
            <span className="opacity-70">(velocity: {rec.destinationStore.salesVelocity} u/day)</span>
          </p>
          <p className="mt-2 font-medium">
            Recommended move: <strong>{rec.recommendedTransferQty} units</strong>
          </p>
        </div>
      ))}
    </div>
  );
};

export default StockAlerts;
