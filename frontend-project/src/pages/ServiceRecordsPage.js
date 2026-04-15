import React, { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardList, Search, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { serviceRecordsAPI } from '../api/serviceRecordsAPI';
import { carsAPI }            from '../api/carsAPI';
import { servicesAPI }        from '../api/servicesAPI';
import { getError, fmtDate, fmtMoney } from '../utils/helpers';

const EMPTY = { ServiceDate:'', PlateNumber:'', ServiceCode:'', Notes:'' };

export default function ServiceRecordsPage() {
  const [records,  setRecords]  = useState([]);
  const [cars,     setCars]     = useState([]);
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState({ open:false, mode:'add', record:null });
  const [confirm,  setConfirm]  = useState({ open:false, id:null });
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c, s] = await Promise.all([
        serviceRecordsAPI.getAll(), carsAPI.getAll(), servicesAPI.getAll()
      ]);
      setRecords(r.data); setCars(c.data); setServices(s.data);
    } catch (err) { toast.error(getError(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'PlateNumber' ? value.toUpperCase() : value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.ServiceDate)     e.ServiceDate = 'Date is required';
    if (!form.PlateNumber)     e.PlateNumber = 'Select a car';
    if (!form.ServiceCode)     e.ServiceCode = 'Select a service';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(EMPTY); setErrors({}); setModal({ open:true, mode:'add', record:null }); };
  const openEdit = (rec) => {
    setForm({
      ServiceDate: rec.ServiceDate?.slice(0,10) || '',
      PlateNumber: rec.PlateNumber,
      ServiceCode: String(rec.ServiceCode),
      Notes:       rec.Notes || '',
    });
    setErrors({});
    setModal({ open:true, mode:'edit', record:rec });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await serviceRecordsAPI.create(form);
        toast.success('Service record added!');
      } else {
        await serviceRecordsAPI.update(modal.record.RecordNumber, form);
        toast.success('Service record updated!');
      }
      setModal({ open:false, mode:'add', record:null });
      fetchAll();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await serviceRecordsAPI.remove(confirm.id);
      toast.success('Record deleted');
      setConfirm({ open:false, id:null });
      fetchAll();
    } catch (err) { toast.error(getError(err)); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return r.PlateNumber?.toLowerCase().includes(q) || r.ServiceName?.toLowerCase().includes(q) ||
           r.Model?.toLowerCase().includes(q) || r.MechanicName?.toLowerCase().includes(q);
  });

  const selectedService = services.find(s => String(s.ServiceCode) === String(form.ServiceCode));

  const InputError = ({ field }) => errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <Layout title="Service Records" subtitle="Full CRUD — add, view, edit, delete service records">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 max-w-sm w-full">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search plate, service, model..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Service Records</h2>
          <span className="text-sm text-gray-400">{filtered.length} records</span>
        </div>
        {loading ? <LoadingSpinner text="Loading records..." /> : filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <ClipboardList size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">{search ? 'No matching records' : 'No service records yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="th">#</th>
                <th className="th">Plate</th>
                <th className="th">Model</th>
                <th className="th">Service</th>
                <th className="th">Price</th>
                <th className="th">Mechanic</th>
                <th className="th">Service Date</th>
                <th className="th">Notes</th>
                <th className="th">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.RecordNumber} className="hover:bg-gray-50">
                    <td className="td text-gray-400 text-xs font-mono">#{r.RecordNumber}</td>
                    <td className="td"><span className="badge-blue font-mono">{r.PlateNumber}</span></td>
                    <td className="td text-sm">{r.CarType} {r.Model}</td>
                    <td className="td font-medium">{r.ServiceName}</td>
                    <td className="td font-bold text-primary-700">{fmtMoney(r.ServicePrice)}</td>
                    <td className="td text-gray-600 text-sm">{r.MechanicName}</td>
                    <td className="td text-gray-500 text-xs">{fmtDate(r.ServiceDate)}</td>
                    <td className="td text-gray-400 text-xs max-w-32 truncate">{r.Notes || '—'}</td>
                    <td className="td">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirm({ open:true, id:r.RecordNumber })}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open:false, mode:'add', record:null })}
        title={modal.mode === 'add' ? 'Add Service Record' : 'Edit Service Record'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Service Date *</label>
              <input name="ServiceDate" type="date" value={form.ServiceDate} onChange={handleChange}
                className={`input-field ${errors.ServiceDate ? 'border-red-400' : ''}`} />
              <InputError field="ServiceDate" />
            </div>
            <div>
              <label className="label-field">Car (Plate Number) *</label>
              <select name="PlateNumber" value={form.PlateNumber} onChange={handleChange}
                className={`input-field ${errors.PlateNumber ? 'border-red-400' : ''}`}>
                <option value="">Select car...</option>
                {cars.map(c => (
                  <option key={c.PlateNumber} value={c.PlateNumber}>
                    {c.PlateNumber} — {c.Model} ({c.CarType})
                  </option>
                ))}
              </select>
              <InputError field="PlateNumber" />
            </div>
            <div className="col-span-2">
              <label className="label-field">Service *</label>
              <select name="ServiceCode" value={form.ServiceCode} onChange={handleChange}
                className={`input-field ${errors.ServiceCode ? 'border-red-400' : ''}`}>
                <option value="">Select service...</option>
                {services.map(s => (
                  <option key={s.ServiceCode} value={s.ServiceCode}>
                    {s.ServiceName} — {fmtMoney(s.ServicePrice)}
                  </option>
                ))}
              </select>
              <InputError field="ServiceCode" />
              {selectedService && (
                <p className="text-xs text-primary-600 mt-1 font-semibold">
                  Service price: {fmtMoney(selectedService.ServicePrice)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="label-field">Notes (optional)</label>
            <textarea name="Notes" value={form.Notes} onChange={handleChange}
              placeholder="Additional details about the repair..."
              rows={3} className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open:false, mode:'add', record:null })} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : modal.mode === 'add' ? 'Add Record' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open:false, id:null })}
        onConfirm={handleDelete} loading={deleting}
        message="Delete this service record? This will also prevent billing for this service." />
    </Layout>
  );
}
