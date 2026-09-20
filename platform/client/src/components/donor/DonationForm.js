import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES    = ['veg','non_veg','vegan','packaged','cooked','raw_produce','dairy','bakery','other'];
const UNITS         = ['servings','kg','litres','pieces','boxes','packets'];
const COMMON_ALLERGENS = ['nuts','gluten','dairy','eggs','soy','shellfish','fish','wheat'];

export default function DonationForm({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState([]);
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({
    foodName: '', category: 'cooked', description: '',
    ingredients: '', allergens: [],
    storageInstructions: '', quantity: '', quantityUnit: 'servings',
    preparedAt: '', shelfLifeHours: '4',
    pickupWindowStart: '', pickupWindowEnd: '',
    'pickupAddress.line1': '', 'pickupAddress.area': '',
    'pickupAddress.city': '', 'pickupAddress.state': '',
    'pickupAddress.pincode': '',
    contactPhone: '',
    safetyAccepted: false, lat: '', lng: ''
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleAllergen = (a) => {
    setForm(p => ({
      ...p,
      allergens: p.allergens.includes(a)
        ? p.allergens.filter(x => x !== a)
        : [...p.allergens, a]
    }));
  };

  // Auto-calculate expiry preview
  const expiresAt = form.preparedAt && form.shelfLifeHours
    ? new Date(new Date(form.preparedAt).getTime() + parseFloat(form.shelfLifeHours) * 3600000)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!form.safetyAccepted) {
      return setErrors([{ msg: 'You must accept the food safety disclaimer' }]);
    }
    if (new Date(form.preparedAt) > new Date()) {
      return setErrors([{ msg: 'Prepared time cannot be in the future' }]);
    }

    const cleanPhone = form.contactPhone.replace(/^(\+91|0)/, '').replace(/\D/g, '');

    const fd = new FormData();
    const fields = {
      foodName: form.foodName.trim(),
      category: form.category,
      description: form.description.trim(),
      ingredients: form.ingredients.trim(),
      allergens: JSON.stringify(form.allergens),
      storageInstructions: form.storageInstructions.trim(),
      quantity: form.quantity,
      quantityUnit: form.quantityUnit,
      preparedAt: form.preparedAt,
      shelfLifeHours: form.shelfLifeHours,
      pickupWindowStart: form.pickupWindowStart,
      pickupWindowEnd: form.pickupWindowEnd,
      'pickupAddress[line1]':   form['pickupAddress.line1'].trim(),
      'pickupAddress[area]':    form['pickupAddress.area'].trim(),
      'pickupAddress[city]':    form['pickupAddress.city'].trim(),
      'pickupAddress[state]':   form['pickupAddress.state'].trim(),
      'pickupAddress[pincode]': form['pickupAddress.pincode'].trim(),
      contactPhone: cleanPhone,
      safetyAccepted: 'true',
      lat: form.lat, lng: form.lng
    };

    Object.entries(fields).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (photoFile) fd.append('photo', photoFile);

    setLoading(true);
    try {
      const { data } = await api.post('/donations', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Donation listed! 🎉 Thank you for fighting hunger.');
      onSuccess && onSuccess(data.donation);
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs && Array.isArray(errs) && errs.length > 0) {
        setErrors(errs);
      } else {
        setErrors([{ msg: err.response?.data?.message || 'Failed to create donation' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>🍱 List a Food Donation</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="alert alert-info" style={{ fontSize: '.78rem', marginBottom: '1rem' }}>
          <strong>🔒 FSSAI Reminder:</strong> Only list food that is freshly prepared, stored correctly, and within shelf life.
          You bear responsibility for food safety. <a href="https://www.fssai.gov.in" target="_blank" rel="noopener noreferrer">FSSAI guidelines →</a>
        </div>

        {errors.length > 0 && (
          <div className="alert alert-error">
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {errors.map((e, i) => <li key={i}>{e.msg}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Food basics */}
          <div className="form-row">
            <div className="form-group">
              <label>Food Name *</label>
              <input type="text" required value={form.foodName} onChange={e => set('foodName', e.target.value)} placeholder="e.g. Dal Rice, Birthday Cake" />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What's in this donation? Any special notes?" />
          </div>

          <div className="form-group">
            <label>Ingredients (list main ones)</label>
            <input type="text" value={form.ingredients} onChange={e => set('ingredients', e.target.value)} placeholder="Rice, Lentils, Spices, Oil…" />
          </div>

          {/* Allergens */}
          <div className="form-group">
            <label>Allergens (check all that apply)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {COMMON_ALLERGENS.map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.allergens.includes(a)} onChange={() => toggleAllergen(a)} style={{ width: 'auto' }} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 10" />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.quantityUnit} onChange={e => set('quantityUnit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="form-row">
            <div className="form-group">
              <label>Prepared At * (cannot be future)</label>
              <input type="datetime-local" required value={form.preparedAt}
                max={new Date().toISOString().slice(0, 16)}
                onChange={e => set('preparedAt', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Safe for how many hours? *</label>
              <select value={form.shelfLifeHours} onChange={e => set('shelfLifeHours', e.target.value)}>
                {[1,2,3,4,6,8,12,24,48].map(h => <option key={h} value={h}>{h}h</option>)}
              </select>
            </div>
          </div>

          {expiresAt && (
            <div className="alert alert-warning" style={{ fontSize: '.8rem', marginBottom: '1rem' }}>
              ⏰ Will expire at: <strong>{expiresAt.toLocaleString('en-IN')}</strong>
            </div>
          )}

          {/* Pickup window */}
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Window Start *</label>
              <input type="datetime-local" required value={form.pickupWindowStart} onChange={e => set('pickupWindowStart', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pickup Window End *</label>
              <input type="datetime-local" required value={form.pickupWindowEnd} onChange={e => set('pickupWindowEnd', e.target.value)} />
            </div>
          </div>

          {/* Pickup address */}
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Address Line 1 *</label>
              <input type="text" required value={form['pickupAddress.line1']} onChange={e => set('pickupAddress.line1', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Area / Locality</label>
              <input type="text" value={form['pickupAddress.area']} onChange={e => set('pickupAddress.area', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input type="text" required value={form['pickupAddress.city']} onChange={e => set('pickupAddress.city', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Phone *</label>
              <input type="tel" required pattern="[6-9][0-9]{9}" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="98XXXXXXXX" />
            </div>
          </div>

          {/* Storage */}
          <div className="form-group">
            <label>Storage Instructions</label>
            <input type="text" value={form.storageInstructions} onChange={e => set('storageInstructions', e.target.value)} placeholder="e.g. Keep refrigerated, consume within 2 hours of pickup" />
          </div>

          {/* Photo */}
          <div className="form-group">
            <label>Photo (optional, max 5 MB)</label>
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ border: 'none', padding: '0' }} />
          </div>

          {/* Geo (optional) */}
          <div className="form-row">
            <div className="form-group">
              <label>Latitude (optional, for map pin)</label>
              <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="e.g. 19.0760" />
            </div>
            <div className="form-group">
              <label>Longitude (optional)</label>
              <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="e.g. 72.8777" />
            </div>
          </div>

          {/* Safety disclaimer */}
          <div className="alert alert-warning" style={{ fontSize: '.78rem', marginBottom: '1rem' }}>
            By listing this donation, you confirm it is safe for consumption per FSSAI standards and you accept full liability for its safety.
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
            <input type="checkbox" id="donSafety" checked={form.safetyAccepted}
              onChange={e => set('safetyAccepted', e.target.checked)} style={{ marginTop: '4px', width: 'auto' }} />
            <label htmlFor="donSafety" style={{ fontSize: '.82rem', cursor: 'pointer' }}>
              I confirm this food is freshly prepared, stored correctly, within shelf life, and safe to consume (FSSAI Act 2006).
            </label>
          </div>

          <button type="submit" className="btn btn-green btn-full" disabled={loading}>
            {loading ? 'Listing…' : '🍱 List Donation'}
          </button>
        </form>
      </div>
    </div>
  );
}
