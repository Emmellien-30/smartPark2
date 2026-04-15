import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { carsAPI } from '../api/carsAPI';
import { getError, validatePlate, fmtDate } from '../utils/helpers';

const EMPTY = { PlateNumber:'', CarType:'', Model:'', ManufacturingYear:'', DriverPhone:'', MechanicName:'' };
const CAR_TYPES = ['Sedan','SUV','Truck','Minivan','Pickup','Bus','Motorcycle','Other'];

export default function CarsPage() {
  const [cars,    setCars]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try { const r = await carsAPI.getAll(); setCars(r.data); }
    catch (err) { toast.error(getError(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'PlateNumber' ? value.toUpperCase() : value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.PlateNumber.trim())   e.PlateNumber = 'Plate number is required';
    else if (!validatePlate(form.PlateNumber)) e.PlateNumber = 'Invalid plate. Example: RAG300S';
    if (!form.CarType.trim())       e.CarType = 'Car type is required';
    if (!form.Model.trim())         e.Model = 'Model is required';
    if (!form.ManufacturingYear)    e.ManufacturingYear = 'Year is required';
    if (!form.DriverPhone.trim())   e.DriverPhone = 'Phone is required';
    if (!form.MechanicName.trim())  e.MechanicName = 'Mechanic name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await carsAPI.create(form);
      toast.success('Car registered successfully!');
      setModal(false); setForm(EMPTY);
      fetchCars();
    } catch (err) { toast.error(getError(err)); }
    finally { setSaving(false); }
  };

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    return c.PlateNumber?.toLowerCase().includes(q) || c.Model?.toLowerCase().includes(q) ||
           c.CarType?.toLowerCase().includes(q) || c.MechanicName?.toLowerCase().includes(q);
  });

  const InputError = ({ field }) => errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <Layout title="Cars" subtitle="Register and manage cars brought for repair">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 max-w-sm w-full">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search plate, model, mechanic..."
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Register Car
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Registered Cars</h2>
          <span className="text-sm text-gray-400">{filtered.length} cars</span>
        </div>
        {loading ? <LoadingSpinner text="Loading cars..." /> : filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <Car size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">{search ? 'No matching cars' : 'No cars registered yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="th">Plate Number</th>
                <th className="th">Type</th>
                <th className="th">Model</th>
                <th className="th">Year</th>
                <th className="th">Driver Phone</th>
                <th className="th">Mechanic</th>
                <th className="th">Registered</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.PlateNumber} className="hover:bg-gray-50">
                    <td className="td"><span className="badge-blue font-mono text-sm">{c.PlateNumber}</span></td>
                    <td className="td"><span className="badge-gray">{c.CarType}</span></td>
                    <td className="td font-medium">{c.Model}</td>
                    <td className="td">{c.ManufacturingYear}</td>
                    <td className="td text-gray-500 text-xs">{c.DriverPhone}</td>
                    <td className="td">{c.MechanicName}</td>
                    <td className="td text-gray-400 text-xs">{fmtDate(c.CreatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Register New Car" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Plate Number *</label>
              <input name="PlateNumber" value={form.PlateNumber} onChange={handleChange}
                placeholder="RAG300S" maxLength={7}
                className={`input-field font-mono ${errors.PlateNumber ? 'border-red-400 focus:ring-red-400' : ''}`} />
              <InputError field="PlateNumber" />
              <p className="text-[11px] text-gray-400 mt-0.5">Format: RAG300S (2 letters + letter + 3 digits + letter)</p>
            </div>
            <div>
              <label className="label-field">Car Type *</label>
              <select name="CarType" value={form.CarType} onChange={handleChange}
                className={`input-field ${errors.CarType ? 'border-red-400' : ''}`}>
                <option value="">Select type...</option>
                {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <InputError field="CarType" />
            </div>
            <div>
              <label className="label-field">Model *</label>
              <input name="Model" value={form.Model} onChange={handleChange}
                placeholder="Toyota Corolla"
                className={`input-field ${errors.Model ? 'border-red-400' : ''}`} />
              <InputError field="Model" />
            </div>
            <div>
              <label className="label-field">Manufacturing Year *</label>
              <input name="ManufacturingYear" type="number" value={form.ManufacturingYear} onChange={handleChange}
                placeholder="2020" min="1990" max={new Date().getFullYear()}
                className={`input-field ${errors.ManufacturingYear ? 'border-red-400' : ''}`} />
              <InputError field="ManufacturingYear" />
            </div>
            <div>
              <label className="label-field">Driver Phone *</label>
              <input name="DriverPhone" value={form.DriverPhone} onChange={handleChange}
                placeholder="+250788000000"
                className={`input-field ${errors.DriverPhone ? 'border-red-400' : ''}`} />
              <InputError field="DriverPhone" />
            </div>
            <div>
              <label className="label-field">Mechanic Name *</label>
              <input name="MechanicName" value={form.MechanicName} onChange={handleChange}
                placeholder="Jean Habimana"
                className={`input-field ${errors.MechanicName ? 'border-red-400' : ''}`} />
              <InputError field="MechanicName" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Register Car'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
