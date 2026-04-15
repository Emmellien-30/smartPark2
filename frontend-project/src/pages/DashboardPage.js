import React, { useEffect, useState } from 'react';
import { Car, Wrench, ClipboardList, CreditCard } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/common/StatCard';
import { reportsAPI } from '../api/reportsAPI';
import { paymentsAPI } from '../api/paymentsAPI';
import { useAuth } from '../context/AuthContext';
import { fmtMoney, fmtDate } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary,  setSummary]  = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([reportsAPI.summary(), paymentsAPI.getAll()])
      .then(([s, p]) => { setSummary(s.data); setPayments(p.data.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.fullname || 'Admin'}!`}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Cars"     value={loading ? '—' : summary?.total_cars     || 0} icon={Car}           color="blue" />
        <StatCard title="Services"       value={loading ? '—' : summary?.total_services || 0} icon={Wrench}        color="orange" />
        <StatCard title="Service Records"value={loading ? '—' : summary?.total_records  || 0} icon={ClipboardList} color="green" />
        <StatCard title="Total Revenue"  value={loading ? '—' : fmtMoney(summary?.total_revenue || 0)} icon={CreditCard} color="blue" />
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Payments</h2>
          <span className="text-xs text-gray-400">{payments.length} latest</span>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No payments yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="th">Payment #</th>
                <th className="th">Plate</th>
                <th className="th">Service</th>
                <th className="th">Amount Paid</th>
                <th className="th">Date</th>
                <th className="th">Method</th>
              </tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.PaymentNumber} className="hover:bg-gray-50">
                    <td className="td font-mono text-xs text-gray-500">#{p.PaymentNumber}</td>
                    <td className="td"><span className="badge-blue font-mono">{p.PlateNumber}</span></td>
                    <td className="td">{p.ServiceName}</td>
                    <td className="td font-bold text-primary-700">{fmtMoney(p.AmountPaid)}</td>
                    <td className="td text-gray-500 text-xs">{fmtDate(p.PaymentDate)}</td>
                    <td className="td"><span className="badge-gray">{p.PaymentMethod}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
