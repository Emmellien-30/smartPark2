import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Wrench, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { servicesAPI } from '../api/servicesAPI';
import { getError, fmtMoney } from '../utils/helpers';

const EMPTY = { ServiceName:'', ServicePrice:'' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try { const r = await servicesAPI.getAll(); setServices(r.data); }
    catch (err) { toast.error(getError(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.ServiceName.trim())   e.ServiceName = 'Service name is required';
    if (!form.ServicePrice)         e.ServicePrice = 'Price is required';
    else if (isNaN(form.ServicePrice) || Number(form.ServicePrice) <= 0)
      e.ServicePrice = 'Enter a valid positive price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await servicesAPI.create(form);
      toast.success('Service added!');
      setModal(false); setForm(EMPTY);
      fetchServices();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const filtered = services.filter(s =>
    s.ServiceName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenuePotential = services.reduce((sum, s) => sum + Number(s.ServicePrice), 0);

  return (
    <Layout title="Services" subtitle="Manage repair services and pricing">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Wrench size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-700">{services.length}</p>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Total Services</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Wrench size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-primary-700">{fmtMoney(totalRevenuePotential)}</p>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Sum of All Prices</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 max-w-sm w-full">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Repair Services</h2>
          <span className="text-sm text-gray-400">{filtered.length} services</span>
        </div>
        {loading ? <LoadingSpinner text="Loading services..." /> : filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <Wrench size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">{search ? 'No matching services' : 'No services added yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="th">Code</th>
                <th className="th">Service Name</th>
                <th className="th">Price (RWF)</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.ServiceCode} className="hover:bg-gray-50">
                    <td className="td text-gray-400 text-xs font-mono">#{String(s.ServiceCode).padStart(3,'0')}</td>
                    <td className="td font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Wrench size={13} className="text-orange-600" />
                        </div>
                        {s.ServiceName}
                      </div>
                    </td>
                    <td className="td font-bold text-primary-700">{fmtMoney(s.ServicePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add New Service" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Service Name *</label>
            <input name="ServiceName" value={form.ServiceName} onChange={handleChange}
              placeholder="e.g. Brake Pad Replacement"
              className={`input-field ${errors.ServiceName ? 'border-red-400' : ''}`} />
            {errors.ServiceName && <p className="text-xs text-red-500 mt-1">{errors.ServiceName}</p>}
          </div>
          <div>
            <label className="label-field">Service Price (RWF) *</label>
            <input name="ServicePrice" type="number" value={form.ServicePrice} onChange={handleChange}
              placeholder="e.g. 150000" min="0" step="1000"
              className={`input-field ${errors.ServicePrice ? 'border-red-400' : ''}`} />
            {errors.ServicePrice && <p className="text-xs text-red-500 mt-1">{errors.ServicePrice}</p>}
            {form.ServicePrice && !errors.ServicePrice && (
              <p className="text-xs text-primary-600 mt-1 font-semibold">{fmtMoney(form.ServicePrice)}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
