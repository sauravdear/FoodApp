import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const TransferPanel = ({ recommendation, onSuccess }) => {
  const { executeTransfer, fetchRecommendations } = useApp();
  const [qty, setQty] = useState(recommendation?.recommendedTransferQty ?? 1);
  const [status, setStatus] = useState(null); // 'loading' | 'ok' | 'error'
  const [message, setMessage] = useState('');

  if (!recommendation) return null;

  const handleApprove = async () => {
    setStatus('loading');
    setMessage('');
    try {
      await executeTransfer({
        foodItemId: recommendation.foodItem.id,
        sourceStoreId: recommendation.sourceStore.id,
        destinationStoreId: recommendation.destinationStore.id,
        quantity: Number(qty),
      });
      setStatus('ok');
      setMessage(`Transferred ${qty} unit(s) successfully.`);
      fetchRecommendations();
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-sm text-gray-200">
      <h3 className="font-semibold text-base mb-3 text-white">Approve Transfer</h3>

      <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-gray-400 mb-4">
        <span>Item</span>
        <span className="text-gray-100">{recommendation.foodItem.name} ({recommendation.foodItem.sku})</span>
        <span>From</span>
        <span className="text-gray-100">{recommendation.sourceStore.name}</span>
        <span>To</span>
        <span className="text-gray-100">{recommendation.destinationStore.name}</span>
        <span>Expires in</span>
        <span className="text-yellow-300">{recommendation.foodItem.daysUntilExpiry.toFixed(1)} day(s)</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-gray-400 w-20">Quantity</label>
        <input
          type="number"
          min={1}
          max={recommendation.sourceStore.surplusUnits}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
        />
        <span className="text-xs text-gray-500">
          max {recommendation.sourceStore.surplusUnits} (surplus)
        </span>
      </div>

      {message && (
        <p className={`text-xs mb-3 ${status === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleApprove}
        disabled={status === 'loading'}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Processing...' : 'Confirm Transfer'}
      </button>
    </div>
  );
};

export default TransferPanel;
