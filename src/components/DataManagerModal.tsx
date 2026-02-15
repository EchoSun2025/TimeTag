import React, { useState } from 'react';
import { downloadExport, parseImportData, importDataMerge, importDataReplace } from '@/lib/dataManager';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DataManagerModal({ isOpen, onClose }: DataManagerModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [exportAllData, setExportAllData] = useState(true);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportAllData) {
        await downloadExport();
      } else {
        const start = exportStartDate ? new Date(exportStartDate) : undefined;
        const end = exportEndDate ? new Date(exportEndDate) : undefined;
        if (start && end) {
          await downloadExport(start, end);
        } else {
          alert('Please select both start and end dates');
          setIsExporting(false);
          return;
        }
      }
      setImportResult('✅ Data exported successfully!');
      setTimeout(() => setImportResult(null), 3000);
    } catch (error) {
      setImportResult(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsExporting(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const parseResult = parseImportData(text);

      if (!parseResult.success) {
        setImportResult(`❌ Import failed: ${parseResult.error}`);
        setIsImporting(false);
        return;
      }

      if (!parseResult.data) {
        setImportResult('❌ Import failed: No data found');
        setIsImporting(false);
        return;
      }

      const result = importMode === 'merge'
        ? await importDataMerge(parseResult.data)
        : await importDataReplace(parseResult.data);

      if (importMode === 'merge') {
        setImportResult(
          `✅ Import complete!\n` +
          `Added ${result.addedRecords} records, ${result.addedTags} tags\n` +
          `Updated ${result.updatedTags || 0} existing tags`
        );
      } else {
        setImportResult(
          `✅ Import complete! Replaced all data.\n` +
          `Added ${result.addedRecords} records, ${result.addedTags} tags`
        );
      }

      // Clear file input
      event.target.value = '';
    } catch (error) {
      setImportResult(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsImporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Data Management</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-4">Export Data</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={exportAllData}
                  onChange={() => setExportAllData(true)}
                  className="w-4 h-4"
                />
                <span>Export all data</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!exportAllData}
                  onChange={() => setExportAllData(false)}
                  className="w-4 h-4"
                />
                <span>Export date range</span>
              </label>
            </div>

            {!exportAllData && (
              <div className="flex items-center gap-4 ml-6">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {isExporting ? 'Exporting...' : 'Export to JSON'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Import Data</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="w-4 h-4"
                />
                <span>Merge with existing data</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="w-4 h-4"
                />
                <span className="text-red-600">Replace all data</span>
              </label>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Merge mode:</strong> Adds new records and tags, updates existing tags with matching names.
              <br />
              <strong className="text-red-600">Replace mode:</strong> Deletes all existing data and replaces it with imported data.
            </div>

            <label className="inline-block px-6 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer transition-colors">
              {isImporting ? 'Importing...' : 'Select JSON File to Import'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Result Message */}
        {importResult && (
          <div className={`mt-4 p-4 rounded whitespace-pre-line ${
            importResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {importResult}
          </div>
        )}

        {/* Format Notice */}
        <div className="mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
          <strong>Compatible with TimeRecord v1 format:</strong> You can import data exported from TimeRecord v1. 
          The "isExcluded" field will be automatically mapped to "isLeisure".
        </div>
      </div>
    </div>
  );
}

export default DataManagerModal;
