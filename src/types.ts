export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  vendorName: string;
  category: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  status: 'pending' | 'processed' | 'error';
  fileName: string;
  itcStatus: 'eligible' | 'blocked';
  itcReason: string;
}

export type ViewType = 'dashboard' | 'upload' | 'reports';
