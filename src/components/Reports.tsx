import React from 'react';
import { InvoiceData } from '../types';
import { Download, FileSpreadsheet, FileText, File as FileIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportsProps {
  invoices: InvoiceData[];
  onClearAll?: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ invoices, onClearAll }) => {
  const processedInvoices = invoices.filter(inv => inv.status === 'processed');
  const totalSpend = processedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalTax = processedInvoices.reduce((sum, inv) => sum + inv.tax, 0);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(processedInvoices.map(inv => ({
      'Vendor Name': inv.vendorName,
      'Invoice Number': inv.invoiceNumber,
      'Date': inv.date,
      'Category': inv.category,
      'Subtotal': inv.subtotal,
      'Tax': inv.tax,
      'Total Amount (INR)': inv.totalAmount,
      'Currency': inv.currency,
      'ITC Status': inv.itcStatus,
      'ITC Reason': inv.itcReason
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, "Invoice_Report.xlsx");
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(processedInvoices.map(inv => ({
      'Vendor Name': inv.vendorName,
      'Invoice Number': inv.invoiceNumber,
      'Date': inv.date,
      'Category': inv.category,
      'Subtotal': inv.subtotal,
      'Tax': inv.tax,
      'Total Amount (INR)': inv.totalAmount,
      'Currency': inv.currency,
      'ITC Status': inv.itcStatus,
      'ITC Reason': inv.itcReason
    })));
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Invoice_Report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Invoice Processing Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Total Spend: INR ${totalSpend.toLocaleString('en-IN')}`, 14, 25);
    doc.text(`Total Tax: INR ${totalTax.toLocaleString('en-IN')}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

    (doc as any).autoTable({
      startY: 45,
      head: [['Vendor', 'Invoice #', 'Date', 'Category', 'ITC Status', 'Amount (INR)']],
      body: processedInvoices.map(inv => [
        inv.vendorName,
        inv.invoiceNumber,
        inv.date,
        inv.category,
        inv.itcStatus.toUpperCase(),
        inv.totalAmount.toLocaleString('en-IN')
      ]),
    });

    doc.save("Invoice_Report.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Batch Summary</h2>
            <p className="text-slate-500 mt-1">Overview of all processed invoices in this session</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportToExcel}
              className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet size={18} />
              <span>Excel</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
            >
              <FileIcon size={18} />
              <span>CSV</span>
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center space-x-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl font-semibold hover:bg-rose-100 transition-colors"
            >
              <FileText size={18} />
              <span>PDF</span>
            </button>
            {onClearAll && processedInvoices.length > 0 && (
              <button 
                onClick={onClearAll}
                className="flex items-center space-x-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
              >
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Processed</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{processedInvoices.length}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Spend (INR)</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">₹{totalSpend.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tax (INR)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{totalTax.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Detailed Breakdown</h3>
        <div className="space-y-6">
          {processedInvoices.map((inv) => (
            <div key={inv.id} className="border border-slate-100 rounded-2xl p-6 hover:border-blue-200 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{inv.vendorName}</h4>
                  <p className="text-sm text-slate-500">Invoice: {inv.invoiceNumber} | Date: {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400">Tax: ₹{inv.tax.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              {inv.items && inv.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Line Items</p>
                  <div className="space-y-2">
                    {inv.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.description} {item.quantity ? `(x${item.quantity})` : ''}</span>
                        <span className="font-medium text-slate-800">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {processedInvoices.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No reports available. Process some invoices first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
