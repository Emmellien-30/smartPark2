import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title='Confirm Delete', message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <p className="text-gray-600 text-sm">{message}</p>
      <div className="flex gap-3 justify-center pt-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </Modal>
);
export default ConfirmDialog;
