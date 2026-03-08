import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { InvoiceData } from '../types';
import { IndianRupee, FileCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';

interface DashboardProps {
  invoices: InvoiceData[];
  onLoadSampleData?: () => void;
  onTestConnection?: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ invoices, onLoadSampleData, onTestConnection }) => {
  const processedInvoices = invoices.filter(inv => inv.status === 'processed');
  
  const totalSpend = processedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalTax = processedInvoices.reduce((sum, inv) => sum + inv.tax, 0);
  
  // Category Data
  const categoryData = processedInvoices.reduce((acc: any[], inv) => {
    const existing = acc.find(item => item.name === inv.category);
    if (existing) {
      existing.value += inv.totalAmount;
    } else {
      acc.push({ name: inv.category || 'Uncategorized', value: inv.totalAmount });
    }
    return acc;
  }, []);

  // Monthly Trend
  const monthlyData = processedInvoices.reduce((acc: any[], inv) => {
    const month = format(parseISO(inv.date), 'MMM yyyy');
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += inv.totalAmount;
    } else {
      acc.push({ month, amount: inv.totalAmount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Tax Distribution
  const taxData = [
    { name: 'Subtotal', value: totalSpend - totalTax },
    { name: 'Tax', value: totalTax }
  ];

  // ITC Distribution
  const itcData = processedInvoices.reduce((acc: any[], inv) => {
    const status = inv.itcStatus === 'eligible' ? 'Eligible ITC' : 'Blocked ITC';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += inv.tax;
    } else {
      acc.push({ name: status, value: inv.tax });
    }
    return acc;
  }, []);

  const stats = [
    { label: 'Total Invoices', value: invoices.length, icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Spend', value: `₹${totalSpend.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Invoice', value: `₹${(totalSpend / (processedInvoices.length || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending/Error', value: invoices.filter(i => i.status !== 'processed').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end space-x-3">
        {onTestConnection && (
          <button 
            onClick={onTestConnection}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all text-sm flex items-center gap-2"
          >
            Test Database Connection
          </button>
        )}
        {onLoadSampleData && processedInvoices.length === 0 && (
          <button 
            onClick={onLoadSampleData}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100"
          >
            Load Sample Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Spend Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Spend Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Expense by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tax vs Subtotal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {taxData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ITC Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">ITC Eligibility (Tax Portion)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={itcData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {itcData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Eligible ITC' ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Invoices</h3>
          <div className="space-y-4">
            {processedInvoices.slice(-5).reverse().map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileCheck className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{inv.vendorName}</p>
                    <p className="text-xs text-slate-500">{inv.date}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            ))}
            {processedInvoices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No processed invoices yet.</p>
                {onLoadSampleData && (
                  <button 
                    onClick={onLoadSampleData}
                    className="text-blue-600 font-semibold hover:underline text-sm"
                  >
                    Load Sample Data
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
