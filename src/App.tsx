/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InvoiceUpload } from './components/InvoiceUpload';
import { InvoiceTable } from './components/InvoiceTable';
import { Reports } from './components/Reports';
import { InvoiceData, ViewType } from './types';
import { Bell, Search, User, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    async function fetchInvoices() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
      } else if (data) {
        // Map database fields back to our InvoiceData type if necessary
        // Assuming the table schema matches our object structure
        setInvoices(data as InvoiceData[]);
      }
      setIsLoading(false);
    }

    fetchInvoices();
  }, []);

  const handleInvoicesProcessed = async (newInvoices: InvoiceData[]) => {
    if (newInvoices.length === 0) return;
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(newInvoices)
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      if (error.code === '42P01') {
        alert('Database table "invoices" not found. Please run the SQL script in your Supabase dashboard to create the table.');
      } else {
        alert(`Failed to save to Supabase: ${error.message}`);
      }
    } else if (data) {
      setInvoices(prev => [...prev, ...data]);
    }
  };

  const handleUpdateInvoice = async (id: string, updateData: Partial<InvoiceData>) => {
    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice.');
    } else {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updateData } : inv));
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice.');
      } else {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      }
    }
  };

  const loadSampleData = async () => {
    const sampleInvoices = [
      {
        invoiceNumber: 'INV-2024-001',
        date: '2024-01-15',
        vendorName: 'Amazon Web Services',
        category: 'Software',
        subtotal: 12000,
        tax: 2160,
        totalAmount: 14160,
        currency: 'INR',
        items: [{ description: 'Cloud Hosting Services', quantity: 1, unitPrice: 12000, amount: 12000 }],
        status: 'processed',
        fileName: 'aws_jan.pdf',
        itcStatus: 'eligible',
        itcReason: 'Cloud services for business operations are eligible for ITC.'
      },
      {
        invoiceNumber: 'QT-8829',
        date: '2024-01-22',
        vendorName: 'Zomato for Business',
        category: 'Food',
        subtotal: 4500,
        tax: 225,
        totalAmount: 4725,
        currency: 'INR',
        items: [{ description: 'Team Lunch', quantity: 1, unitPrice: 4500, amount: 4500 }],
        status: 'processed',
        fileName: 'zomato_lunch.png',
        itcStatus: 'blocked',
        itcReason: 'Food and beverages for personal consumption or staff welfare are blocked under Sec 17(5)(b)(i).'
      },
      {
        invoiceNumber: 'TEL-FEB-01',
        date: '2024-02-05',
        vendorName: 'Airtel Business',
        category: 'Utilities',
        subtotal: 8500,
        tax: 1530,
        totalAmount: 10030,
        currency: 'INR',
        items: [{ description: 'Leased Line Internet', quantity: 1, unitPrice: 8500, amount: 8500 }],
        status: 'processed',
        fileName: 'airtel_bill.pdf',
        itcStatus: 'eligible',
        itcReason: 'Telecommunication services for business use are eligible for ITC.'
      },
      {
        invoiceNumber: 'OFF-992',
        date: '2024-02-18',
        vendorName: 'Staples India',
        category: 'Office Supplies',
        subtotal: 3200,
        tax: 576,
        totalAmount: 3776,
        currency: 'INR',
        items: [{ description: 'Printer Ink & Paper', quantity: 1, unitPrice: 3200, amount: 3200 }],
        status: 'processed',
        fileName: 'staples_receipt.jpg',
        itcStatus: 'eligible',
        itcReason: 'Office supplies used for business are eligible for ITC.'
      },
      {
        invoiceNumber: 'TRV-2024-12',
        date: '2024-03-01',
        vendorName: 'MakeMyTrip',
        category: 'Travel',
        subtotal: 15000,
        tax: 2700,
        totalAmount: 17700,
        currency: 'INR',
        items: [{ description: 'Flight Booking - BLR to DEL', quantity: 1, unitPrice: 15000, amount: 15000 }],
        status: 'processed',
        fileName: 'flight_ticket.pdf',
        itcStatus: 'eligible',
        itcReason: 'Business travel is eligible for ITC.'
      }
    ];
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(sampleInvoices)
      .select();

    if (error) {
      console.error('Error loading sample data:', error);
    } else if (data) {
      setInvoices(data as InvoiceData[]);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('invoices').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          alert('❌ Database table "invoices" not found. Please run the SQL script in your Supabase dashboard.');
        } else {
          alert(`❌ Supabase Error: ${error.message}`);
        }
      } else {
        alert('✅ Supabase connection successful! The "invoices" table is ready.');
      }
    } catch (err) {
      alert('❌ Failed to connect to Supabase. Check your console for details.');
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL invoices from the database? This cannot be undone.')) {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data.');
      } else {
        setInvoices([]);
        alert('All data cleared successfully.');
      }
    }
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-medium">Connecting to Supabase...</p>
        </div>
      );
    }
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            invoices={invoices} 
            onLoadSampleData={loadSampleData} 
            onTestConnection={testSupabaseConnection}
          />
        );
      case 'upload':
        return (
          <div className="space-y-8">
            <InvoiceUpload onInvoicesProcessed={handleInvoicesProcessed} />
            {invoices.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">Review & Edit</h3>
                <InvoiceTable 
                  invoices={invoices} 
                  onUpdate={handleUpdateInvoice} 
                  onDelete={handleDeleteInvoice} 
                />
              </div>
            )}
          </div>
        );
      case 'reports':
        return <Reports invoices={invoices} onClearAll={handleClearAll} />;
      default:
        return <Dashboard invoices={invoices} />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard Overview';
      case 'upload': return 'Invoice Processing';
      case 'reports': return 'Financial Reports';
      default: return 'Invoice Processing Tool';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Finance Manager</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

