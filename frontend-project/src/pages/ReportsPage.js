import React, { useEffect, useState, useRef } from 'react';
import { BarChart3, Printer, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportsAPI } from '../api/reportsAPI';
import { getError, fmtMoney, fmtDate } from '../utils/helpers';

export default function ReportsPage() {
  const [dates,        setDates]        = useState([]);
  const [selDate,      setSelDate]      = useState('');
  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);
  const reportRef = useRef();

  // Load available dates on mount
  useEffect(() => {
    reportsAPI.dates()
      .then(r => { setDates(r.data); if (r.data.length > 0) setSelDate(r.data[0]); })
      .catch(() => toast.error('Failed to load dates'))
      .finally(() => setLoadingDates(false));
  }, []);

  // Load report when date changes
  useEffect(() => {
    if (!selDate) { setReport(null); return; }
    setLoading(true);
    reportsAPI.daily(selDate)
      .then(r => setReport(r.data))
      .catch(err => toast.error(getError(err)))
      .finally(() => setLoading(false));
  }, [selDate]);

  const printReport = () => {
    const content = reportRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Daily Report — ${selDate}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;padding:28px;color:#111;font-size:13px}
        h1{font-size:1.5rem;font-weight:700;text-align:center}
        .sub{text-align:center;color:#555;margin-bottom:18px;font-size:.85rem}
        .badge{display:inline-block;background:#1d4ed8;color:#fff;padding:4px 14px;border-radius:20px;font-size:.8rem;font-weight:600}
        .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}
        .sum-box{border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center}
        .sum-val{font-size:1.35rem;font-weight:700;color:#1d4ed8}
        .sum-lbl{font-size:.72rem;color:#777;text-transform:uppercase;letter-spacing:.06em;margin-top:3px}
        table{width:100%;border-collapse:collapse;margin-top:14px}
        th{background:#1d4ed8;color:#fff;padding:8px 10px;text-align:left;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
        td{padding:7px 10px;border-bottom:1px solid #eee;font-size:.84rem}
        tr:nth-child(even) td{background:#f9fafb}
        tfoot td{font-weight:700;background:#eff6ff;color:#1e40af}
        .sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:14px}
        .sig-box{text-align:center;border-top:2px solid #999;padding-top:6px;font-size:.82rem}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const methodBadge = (m) => ({
    'Cash':          'badge-green',
    'Mobile Money':  'badge-blue',
    'Bank Transfer': 'badge-orange',
  }[m] || 'badge-gray');

  return (
    <Layout title="Daily Reports" subtitle="Generate and print daily payment reports">
      {/* Filter bar */}
      <div className="card mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Calendar size={20} className="text-primary-600 flex-shrink-0" />
          <span className="font-semibold text-gray-800 whitespace-nowrap">Report Date:</span>
          {loadingDates ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : dates.length === 0 ? (
            <span className="text-sm text-red-500">No payment records found</span>
          ) : (
            <select value={selDate} onChange={e => setSelDate(e.target.value)}
              className="input-field max-w-xs">
              {dates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>
        {report && report.records.length > 0 && (
          <button onClick={printReport} className="btn-primary flex-shrink-0">
            <Printer size={16} /> Print Report
          </button>
        )}
      </div>

      {!selDate ? (
        <div className="card py-16 text-center text-gray-400">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
          <p>Select a date above to generate the daily report</p>
        </div>
      ) : loading ? (
        <LoadingSpinner text="Generating report..." />
      ) : !report || report.records.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No records for <strong className="text-gray-700">{selDate}</strong></p>
          <p className="text-sm mt-1">Record a payment for this date first.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div ref={reportRef}>
            {/* Report header */}
            <div className="bg-primary-700 px-6 py-5 text-center text-white">
              <h1 className="text-xl font-bold">SmartPark Garage — Daily Report</h1>
              <p className="text-primary-200 text-sm mt-0.5">Rubavu District, Western Province, Rwanda</p>
              <div className="mt-2 inline-block bg-white/20 px-5 py-1.5 rounded-full text-sm font-semibold">
                {selDate}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-100">
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-700">{report.total_cars}</p>
                <p className="text-xs text-primary-600 font-semibold mt-1 uppercase tracking-wide">Cars Serviced</p>
              </div>
              <div className="bg-success-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-success-700">{fmtMoney(report.total_amount)}</p>
                <p className="text-xs text-success-600 font-semibold mt-1 uppercase tracking-wide">Total Received</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {[...new Set(report.records.map(r => r.ServiceName))].length}
                </p>
                <p className="text-xs text-orange-600 font-semibold mt-1 uppercase tracking-wide">Service Types</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800">
                    {['#','Plate','Car','Driver Phone','Service','Service Price','Amount Paid','Method','Received By'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.records.map((r, i) => (
                    <tr key={r.PaymentNumber} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="badge-blue font-mono">{r.PlateNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{r.CarType} {r.Model}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.DriverPhone}</td>
                      <td className="px-4 py-3 text-sm font-medium">{r.ServiceName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmtMoney(r.ServicePrice)}</td>
                      <td className="px-4 py-3 font-bold text-success-700">{fmtMoney(r.AmountPaid)}</td>
                      <td className="px-4 py-3">
                        <span className={methodBadge(r.PaymentMethod)}>{r.PaymentMethod}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{r.ReceivedBy}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-primary-50 border-t-2 border-primary-200">
                    <td colSpan={6} className="px-4 py-3 text-sm font-bold text-primary-900 text-right">
                      TOTAL RECEIVED ({report.total_cars} car{report.total_cars !== 1 ? 's' : ''}):
                    </td>
                    <td className="px-4 py-3 font-bold text-success-700 text-sm">{fmtMoney(report.total_amount)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 px-8 py-6 border-t border-gray-100">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 mt-10 pt-2">
                  <p className="text-sm font-semibold text-gray-700">Chief Mechanic Signature</p>
                  <p className="text-xs text-gray-400 mt-1">Name &amp; Date: _______________</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-400 mt-10 pt-2">
                  <p className="text-sm font-semibold text-gray-700">Manager Signature</p>
                  <p className="text-xs text-gray-400 mt-1">Name &amp; Date: _______________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
