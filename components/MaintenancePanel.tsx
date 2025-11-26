import React, { useEffect, useState } from 'react';
import { tcnIntegrationService } from '../services/tcnIntegrationService';

interface MaintenancePanelProps {
  visible: boolean;
  onClose: () => void;
}

const getSlotStatusColor = (count: number, maxCount: number) => {
  const percentage = count / maxCount;
  if (percentage >= 0.8) return 'text-green-500';
  if (percentage >= 0.6) return 'text-yellow-500';
  if (percentage >= 0.4) return 'text-orange-500';
  return 'text-red-500';
};

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ visible, onClose }) => {
  const [slotInventory, setSlotInventory] = useState<{ [key: number]: number }>({});
  const [slotsNeedingRefill, setSlotsNeedingRefill] = useState<number[]>([]);
  const [vendingStatus, setVendingStatus] = useState<string>('Ready');
  const [tcnStatus, setTcnStatus] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const fetchInventory = async () => {
      try {
        const inv = await tcnIntegrationService.getSlotInventory();
        if (!mounted) return;
        setSlotInventory(inv);

        const needing = await tcnIntegrationService.getSlotsNeedingRefill(0.8);
        if (!mounted) return;
        setSlotsNeedingRefill(needing);
      } catch (err) {
        console.error('[MAINTENANCE PANEL] Inventory fetch error', err);
      }
    };

    // Only poll while visible to reduce background activity
    if (visible) {
      fetchInventory();
      const interval = setInterval(fetchInventory, 2000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      mounted = false;
    };
  }, [visible]);

  const handleManualDispense = async (tier: 'gold' | 'silver') => {
    const success = await tcnIntegrationService.dispensePrizeManually(tier);
    if (success) {
      setVendingStatus(`Manual ${tier} prize dispensed!`);
      setTimeout(() => setVendingStatus('Ready'), 2000);
    } else {
      setVendingStatus('Manual dispensing failed');
      setTimeout(() => setVendingStatus('Ready'), 2000);
    }
  };

  const handleResetCounts = () => {
    tcnIntegrationService.resetSlotCounts();
    setVendingStatus('Slot counts reset');
    setTimeout(() => setVendingStatus('Ready'), 1500);
  };

  const handleRefreshTcnStatus = async () => {
    try {
      if (!(window as any).electronAPI || !(window as any).electronAPI.getTcnStatus) {
        setTcnStatus({ error: 'electronAPI.getTcnStatus not available' });
        return;
      }
      const status = await (window as any).electronAPI.getTcnStatus();
      setTcnStatus(status);
    } catch (err) {
      console.error('[MAINTENANCE PANEL] Failed to fetch TCN status', err);
      setTcnStatus({ error: err && err.message ? err.message : String(err) });
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-8 z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Maintenance Panel</h2>

        <div className="text-lg mt-2 text-gray-400 space-y-2">
          <p>Vending Status: {vendingStatus}</p>
          <div className="mt-4 p-2 bg-gray-800 rounded text-sm">
            <p className="text-yellow-400 font-semibold mb-2">Slot Inventory:</p>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {Object.entries(slotInventory).map(([slotNum, count]) => (
                <div key={slotNum} className={`text-center p-1 rounded ${getSlotStatusColor(Number(count), 5)}`}>
                  <div className="font-semibold">S{slotNum}</div>
                  <div>{Number(count)}/5</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white mb-2">TCN / Serial Status</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshTcnStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Refresh TCN Status
              </button>
              <div className="text-sm text-gray-300">
                {tcnStatus ? <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(tcnStatus, null, 2)}</pre> : <span>Not fetched</span>}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Manual Dispense</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleManualDispense('gold')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Gold
              </button>
              <button
                onClick={() => handleManualDispense('silver')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Silver
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Slot Management</h3>
            <div className="space-y-2">
              <button
                onClick={handleResetCounts}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
              >
                Reset All Slot Counts
              </button>

              <div className="text-white text-sm">
                <p className="mb-1">Max dispenses per slot: 5</p>
                <p>Slots needing refill (≤80% used):</p>
                <div className="grid grid-cols-5 gap-1 text-xs mt-2">
                  {slotsNeedingRefill.map(slotNum => (
                    <div key={slotNum} className="bg-red-800 text-white p-1 rounded text-center">
                      S{slotNum}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded w-full mt-4"
          >
            Close Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePanel;
