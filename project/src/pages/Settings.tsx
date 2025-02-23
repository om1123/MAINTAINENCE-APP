import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/toast';
import ScrollableDialog from '../components/ScrollableDialog';

const Settings: React.FC = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'clear' | 'reset' | null>(null);

  const handleClearData = async () => {
    try {
      setLoading(true);
      
      // Delete all work orders first (due to foreign key constraints)
      const { error: workOrdersError } = await supabase
        .from('work_orders')
        .delete()
        .neq('id', '');
      
      if (workOrdersError) throw workOrdersError;

      // Then delete all machines
      const { error: machinesError } = await supabase
        .from('machines')
        .delete()
        .neq('id', '');
      
      if (machinesError) throw machinesError;

      showToast.success('All data has been cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast.error('Failed to clear data');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleResetSystem = async () => {
    try {
      setLoading(true);
      
      // Delete all data from all tables
      const { error: clearError } = await supabase.rpc('reset_system');
      
      if (clearError) throw clearError;

      showToast.success('System has been reset successfully');
    } catch (error) {
      console.error('Error resetting system:', error);
      showToast.error('Failed to reset system');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmAction = () => {
    if (action === 'clear') {
      handleClearData();
    } else if (action === 'reset') {
      handleResetSystem();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Settings</h1>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gradient mb-6">Data Management</h2>

        <div className="space-y-6">
          {/* Clear Data */}
          <div className="border-b border-gray-700/50 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Clear All Data</h3>
                <p className="text-gray-400 mt-1">
                  Remove all machines and work orders from the system. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setAction('clear');
                  setShowConfirmDialog(true);
                }}
                className="btn bg-red-500 hover:bg-red-600 text-white flex items-center px-4 py-2"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </button>
            </div>
          </div>

          {/* Reset System */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-200">Reset System</h3>
                <p className="text-gray-400 mt-1">
                  Reset the entire system to its initial state. All data will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => {
                  setAction('reset');
                  setShowConfirmDialog(true);
                }}
                className="btn bg-orange-500 hover:bg-orange-600 text-white flex items-center px-4 py-2"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset System
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ScrollableDialog
        title="Confirm Action"
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="28rem"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-12 h-12" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-200">
              {action === 'clear' ? 'Clear All Data?' : 'Reset System?'}
            </h3>
            <p className="text-gray-400 mt-2">
              {action === 'clear'
                ? 'This will permanently remove all machines and work orders from the system. This action cannot be undone.'
                : 'This will reset the entire system to its initial state. All data will be permanently removed. This action cannot be undone.'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowConfirmDialog(false)}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              className="btn bg-red-500 hover:bg-red-600 text-white flex-1 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </ScrollableDialog>
    </div>
  );
};

export default Settings;