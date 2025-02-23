import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle } from 'lucide-react';
import { exportToExcel } from '../lib/exportToExcel';
import { showToast } from '../lib/toast';

const ExportData: React.FC = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const success = await exportToExcel();
      if (success) {
        showToast.success('Data exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gradient mb-8">Export Data</h1>

      <div className="card p-8">
        <div className="text-center">
          <FileSpreadsheet className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gradient mb-4">
            Export to Excel
          </h2>
          <p className="text-gray-300 mb-8">
            Download a comprehensive Excel file containing all machine and work order data.
            The export includes:
          </p>
          
          <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
            <li className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
              Complete machine inventory and details
            </li>
            <li className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
              All work orders (pending and completed)
            </li>
            <li className="flex items-center text-gray-300">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
              Maintenance history and statistics
            </li>
          </ul>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary glow inline-flex items-center"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;