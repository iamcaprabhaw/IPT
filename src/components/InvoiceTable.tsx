import React from 'react';
import { InvoiceData } from '../types';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface InvoiceTableProps {
  invoices: InvoiceData[];
  onUpdate: (id: string, data: Partial<InvoiceData>) => void;
  onDelete: (id: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<InvoiceData>>({});

  const startEditing = (invoice: InvoiceData) => {
    setEditingId(invoice.id);
    setEditForm(invoice);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ITC Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount (₹)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === invoice.id ? (
                    <input 
                      className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.vendorName}
                      onChange={e => setEditForm({...editForm, vendorName: e.target.value})}
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">{invoice.vendorName}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {editingId === invoice.id ? (
                    <input 
                      className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.invoiceNumber}
                      onChange={e => setEditForm({...editForm, invoiceNumber: e.target.value})}
                    />
                  ) : (
                    invoice.invoiceNumber
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {editingId === invoice.id ? (
                    <input 
                      type="date"
                      className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.date}
                      onChange={e => setEditForm({...editForm, date: e.target.value})}
                    />
                  ) : (
                    invoice.date
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === invoice.id ? (
                    <select 
                      className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.category}
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                    >
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Software">Software</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="General">General</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {invoice.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full w-fit ${
                      invoice.itcStatus === 'eligible' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {invoice.itcStatus === 'eligible' ? 'Eligible' : 'Blocked'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[150px] leading-tight">
                      {invoice.itcReason}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {editingId === invoice.id ? (
                    <input 
                      type="number"
                      className="w-24 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right"
                      value={editForm.totalAmount}
                      onChange={e => setEditForm({...editForm, totalAmount: parseFloat(e.target.value)})}
                    />
                  ) : (
                    `₹${invoice.totalAmount.toLocaleString('en-IN')}`
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {editingId === invoice.id ? (
                      <>
                        <button onClick={saveEdit} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(invoice)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => onDelete(invoice.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No invoices processed yet. Go to Upload to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
