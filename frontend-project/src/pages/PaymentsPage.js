import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, CreditCard, Search, Printer, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { paymentsAPI }       from '../api/paymentsAPI';
import { serviceRecordsAPI } from '../api/serviceRecordsAPI';
import { carsAPI }           from '../api/carsAPI';
import { getError, fmtMoney, fmtDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const EMPTY = { AmountPaid:'', PaymentDate:'', PlateNumber:'', RecordNumber:'', PaymentMethod:'Cash', ReceivedBy:'' };
const METHODS = ['Cash','Mobile Money','Bank Transfer'];

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [records,  setRecords]  = useState([]);
  const [cars,     setCars]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [billModal,setBillModal]= useState(false);
  const [bill,     setBill]     = useState(null);
  const [form,     setForm]     = useState({ ...EMPTY, ReceivedBy: user?.fullname || '' });
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const billRef = useRef();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r, c] = await Promise.all([
        paymentsAPI.getAll(), serviceRecordsAPI.getAll(), carsAPI.getAll()
      ]);
      setPayments(p.data); setRecords(r.data); setCars(c.data);
    } catch (err) { toast.error(getError(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // When car is selected, filter records to that car
  const carRecords = form.PlateNumber
    ? records.filter(r => r.PlateNumber === form.PlateNumber)
    : records;

  // Auto-fill AmountPaid from selected record's service price
  const selectedRecord = records.find(r => String(r.RecordNumber) === String(form.RecordNumber));

  const handleChange = (e) => {
    const { name, value } = e.target;
    let update = { [name]: name === 'PlateNumber' ? value.toUpperCase() : value };
    if (name === 'PlateNumber') update.RecordNumber = ''; // reset record when plate changes
    if (name === 'RecordNumber' && value) {
      const rec = records.find(r => String(r.RecordNumber) === value);
      if (rec) {
        update.PlateNumber = rec.PlateNumber;
        update.AmountPaid  = String(rec.ServicePrice);
      }
    }
    setForm(p => ({ ...p, ...update }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.AmountPaid)      e.AmountPaid = 'Amount is required';
    else if (isNaN(form.AmountPaid) || Number(form.AmountPaid) <= 0)
      e.AmountPaid = 'Enter a valid positive amount';
    if (!form.PaymentDate)     e.PaymentDate = 'Date is required';
    if (!form.PlateNumber)     e.PlateNumber = 'Select a car';
    if (!form.RecordNumber)    e.RecordNumber = 'Select a service record';
    if (!form.ReceivedBy.trim()) e.ReceivedBy = 'Received by is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await paymentsAPI.create(form);
      toast.success('Payment recorded!');
      setModal(false);
      setForm({ ...EMPTY, ReceivedBy: user?.fullname || '' });
      fetchAll();
      // Auto-open bill after payment
      if (res.data.PaymentNumber) {
        const billRes = await paymentsAPI.getBill(res.data.PaymentNumber);
        setBill(billRes.data); setBillModal(true);
      }
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const openBill = async (id) => {
    try {
      const res = await paymentsAPI.getBill(id);
      setBill(res.data); setBillModal(true);
    } catch (err) { toast.error(getError(err)); }
  };

  const printBill = () => {
    const content = billRef.current?.innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Bill</title><style>
      body{font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:0 auto}
      table{width:100%;border-collapse:collapse}
      td,th{padding:8px;border:1px solid #ddd}
      th{background:#f5f5f5}
      .total{font-weight:bold;font-size:1.2em}
    </style></head><body>${content}</body></html>`);
    w.document.close(); w.print(); w.close();
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return p.PlateNumber?.toLowerCase().includes(q) || p.ServiceName?.toLowerCase().includes(q) ||
           p.Model?.toLowerCase().includes(q) || p.ReceivedBy?.toLowerCase().includes(q);
  });

  const totalPaid = filtered.reduce((s, p) => s + Number(p.AmountPaid), 0);
  const InputError = ({ field }) => errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <Layout title="Payments" subtitle="Record and manage car repair payments">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
            <CreditCard size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-700">{payments.length}</p>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Total Payments</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-success-100 flex items-center justify-center">
            <CreditCard size={20} className="text-success-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-success-700">{fmtMoney(totalPaid)}</p>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Showing Total</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 max-w-sm w-full">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search plate, service, model..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button onClick={() => { setForm({ ...EMPTY, ReceivedBy: user?.fullname || '' }); setErrors({}); setModal(true); }} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Payment Records</h2>
          <span className="text-sm text-gray-400">{filtered.length} records</span>
        </div>
        {loading ? <LoadingSpinner text="Loading payments..." /> : filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <CreditCard size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">{search ? 'No matching payments' : 'No payments recorded yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="th">#</th>
                <th className="th">Plate</th>
                <th className="th">Model</th>
                <th className="th">Service</th>
                <th className="th">Amount Paid</th>
                <th className="th">Method</th>
                <th className="th">Received By</th>
                <th className="th">Date</th>
                <th className="th">Bill</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.PaymentNumber} className="hover:bg-gray-50">
                    <td className="td text-gray-400 text-xs font-mono">#{p.PaymentNumber}</td>
                    <td className="td"><span className="badge-blue font-mono">{p.PlateNumber}</span></td>
                    <td className="td text-sm">{p.Model}</td>
                    <td className="td">{p.ServiceName}</td>
                    <td className="td font-bold text-success-700">{fmtMoney(p.AmountPaid)}</td>
                    <td className="td"><span className="badge-gray">{p.PaymentMethod}</span></td>
                    <td className="td text-sm">{p.ReceivedBy}</td>
                    <td className="td text-gray-500 text-xs">{fmtDate(p.PaymentDate)}</td>
                    <td className="td">
                      <button onClick={() => openBill(p.PaymentNumber)}
                        className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="View Bill">
                        <FileText size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-700 text-right">TOTAL:</td>
                  <td className="px-4 py-3 font-bold text-success-700">{fmtMoney(totalPaid)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Record Payment" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Select Car *</label>
              <select name="PlateNumber" value={form.PlateNumber} onChange={handleChange}
                className={`input-field ${errors.PlateNumber ? 'border-red-400' : ''}`}>
                <option value="">Select car...</option>
                {cars.map(c => (
                  <option key={c.PlateNumber} value={c.PlateNumber}>
                    {c.PlateNumber} — {c.Model}
                  </option>
                ))}
              </select>
              <InputError field="PlateNumber" />
            </div>
            <div>
              <label className="label-field">Service Record *</label>
              <select name="RecordNumber" value={form.RecordNumber} onChange={handleChange}
                className={`input-field ${errors.RecordNumber ? 'border-red-400' : ''}`}>
                <option value="">Select service record...</option>
                {carRecords.map(r => (
                  <option key={r.RecordNumber} value={r.RecordNumber}>
                    #{r.RecordNumber} — {r.ServiceName} ({fmtDate(r.ServiceDate)})
                  </option>
                ))}
              </select>
              <InputError field="RecordNumber" />
              {selectedRecord && (
                <p className="text-xs text-primary-600 mt-1 font-semibold">
                  Service price: {fmtMoney(selectedRecord.ServicePrice)}
                </p>
              )}
            </div>
            <div>
              <label className="label-field">Amount Paid (RWF) *</label>
              <input name="AmountPaid" type="number" value={form.AmountPaid} onChange={handleChange}
                placeholder="Auto-filled from service" min="0" step="1000"
                className={`input-field ${errors.AmountPaid ? 'border-red-400' : ''}`} />
              <InputError field="AmountPaid" />
            </div>
            <div>
              <label className="label-field">Payment Date *</label>
              <input name="PaymentDate" type="date" value={form.PaymentDate} onChange={handleChange}
                className={`input-field ${errors.PaymentDate ? 'border-red-400' : ''}`} />
              <InputError field="PaymentDate" />
            </div>
            <div>
              <label className="label-field">Payment Method</label>
              <select name="PaymentMethod" value={form.PaymentMethod} onChange={handleChange} className="input-field">
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Received By *</label>
              <input name="ReceivedBy" value={form.ReceivedBy} onChange={handleChange}
                placeholder="Jean Habimana"
                className={`input-field ${errors.ReceivedBy ? 'border-red-400' : ''}`} />
              <InputError field="ReceivedBy" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-success flex-1 justify-center">
              {saving ? 'Recording...' : 'Record Payment & Generate Bill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bill Modal */}
      <Modal isOpen={billModal} onClose={() => setBillModal(false)} title="Payment Bill" size="md">
        {bill && (
          <div>
            <div ref={billRef}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">SmartPark Garage</h2>
                <p className="text-gray-500 text-sm">Rubavu District, Western Province, Rwanda</p>
                <p className="text-gray-400 text-xs">Tel: +250 788 000 000</p>
                <div className="mt-3 inline-block bg-primary-600 text-white px-6 py-1 rounded-full font-bold text-sm">
                  PAYMENT RECEIPT
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Bill Details</div>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Bill No',      `#${bill.PaymentNumber}`],
                      ['Date',         fmtDate(bill.PaymentDate)],
                      ['Plate Number', bill.PlateNumber],
                      ['Car',          `${bill.CarType} — ${bill.Model} (${bill.ManufacturingYear})`],
                      ['Driver Phone', bill.DriverPhone],
                      ['Service',      bill.ServiceName],
                      ['Service Date', fmtDate(bill.ServiceDate)],
                      ['Payment Method', bill.PaymentMethod],
                      ['Received By',  bill.ReceivedBy],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-t border-gray-100">
                        <td className="px-4 py-2.5 font-semibold text-gray-600 w-40">{label}</td>
                        <td className="px-4 py-2.5 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-600 font-semibold mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-primary-700">{fmtMoney(bill.AmountPaid)}</p>
                {Number(bill.AmountPaid) < Number(bill.ServicePrice) && (
                  <p className="text-xs text-orange-600 mt-1">
                    Remaining: {fmtMoney(Number(bill.ServicePrice) - Number(bill.AmountPaid))}
                  </p>
                )}
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Thank you for choosing SmartPark Garage!
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setBillModal(false)} className="btn-secondary flex-1 justify-center">Close</button>
              <button onClick={printBill} className="btn-primary flex-1 justify-center">
                <Printer size={15} /> Print Bill
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
