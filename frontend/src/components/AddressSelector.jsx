import { useState } from 'react';
import { isValidIndianMobileNumber, isValidIndianPinCode } from '../utils/shop';

const emptyAddress = {
  recipient: '', phone: '', house: '', street: '', locality: '', city: '', state: '', pin: '', landmark: '', type: 'Home',
};

function AddressSelector({ account, selectedAddressId, onSelect, onAccountChange, onClose, onCheckout }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const addresses = account.addresses || [];

  const beginAdd = () => {
    setEditingId('new');
    setError('');
    setForm({ ...emptyAddress, recipient: account.name || '', phone: account.mobile || '' });
  };
  const beginEdit = (address) => {
    setEditingId(address.id);
    setError('');
    setForm({ ...emptyAddress, ...address });
  };
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const saveAddress = (event) => {
    event.preventDefault();
    setError('');
    if (Object.entries(form).some(([key, value]) => key !== 'landmark' && !value.trim())) {
      setError('Please complete all required address fields.');
      return;
    }
    if (!isValidIndianMobileNumber(form.phone) || !isValidIndianPinCode(form.pin)) {
      setError('Enter a valid 10-digit recipient phone number and 6-digit PIN code.');
      return;
    }
    const isNew = editingId === 'new';
    const saved = {
      ...form,
      id: isNew ? `address-${Date.now()}` : editingId,
      isDefault: isNew ? addresses.length === 0 || !addresses.some((address) => address.isDefault) : form.isDefault,
    };
    const nextAddresses = isNew
      ? [...addresses, saved]
      : addresses.map((item) => item.id === editingId ? saved : item);
    onAccountChange({ ...account, addresses: nextAddresses });
    if (!selectedAddressId || saved.isDefault) onSelect(saved.id);
    setEditingId(null);
  };
  const removeAddress = (id) => {
    if (!window.confirm('Delete this saved delivery address?')) return;
    const wasDefault = addresses.find((address) => address.id === id)?.isDefault;
    const wasSelected = selectedAddressId === id;
    let nextAddresses = addresses.filter((address) => address.id !== id);
    if (wasDefault && nextAddresses.length > 0) {
      nextAddresses = nextAddresses.map((address, index) => ({ ...address, isDefault: index === 0 }));
    }
    onAccountChange({ ...account, addresses: nextAddresses });
    if (wasSelected) {
      onSelect(nextAddresses.find((address) => address.isDefault)?.id || nextAddresses[0]?.id || null);
    }
  };
  const setDefault = (id) => {
    const nextAddresses = addresses.map((address) => ({ ...address, isDefault: address.id === id }));
    onAccountChange({ ...account, addresses: nextAddresses });
    onSelect(id);
  };
  const finish = () => {
    if (!selectedAddressId) {
      setError('Select or add a delivery address before checkout.');
      return;
    }
    if (onCheckout) onCheckout();
    else onClose();
  };
  const useCurrentLocation = () => {
    setLocationNotice('');
    if (!navigator.geolocation) {
      setLocationNotice('Location detection is unavailable in this browser. Enter your address manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        setForm((current) => ({ ...current, locality: current.locality || `Near ${coordinates}` }));
        setLocationNotice(`Location found (${coordinates}). Complete the remaining address fields manually.`);
      },
      () => setLocationNotice('Could not access your location. Check browser permission or enter your address manually.'),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog address-dialog" role="dialog" aria-modal="true" aria-labelledby="address-title">
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <p className="eyebrow">Delivery, your way</p>
        <h2 id="address-title">{editingId ? (editingId === 'new' ? 'Add an address' : 'Edit address') : 'Your addresses'}</h2>
        {editingId ? (
          <form className="dialog-form address-form" onSubmit={saveAddress}>
            <div className="form-row">
              <label>Recipient name<input required value={form.recipient} onChange={(event) => updateField('recipient', event.target.value)} /></label>
              <label>Recipient phone<input required inputMode="numeric" maxLength={10} value={form.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, ''))} /></label>
            </div>
            <label>House / flat number<input required value={form.house} onChange={(event) => updateField('house', event.target.value)} /></label>
            <label>Building / street<input required value={form.street} onChange={(event) => updateField('street', event.target.value)} /></label>
            <button className="text-button location-button" type="button" onClick={useCurrentLocation}>⌖ Use my current location</button>
            {locationNotice && <p className="location-notice" role="status">{locationNotice}</p>}
            <label>Area / locality<input required value={form.locality} onChange={(event) => updateField('locality', event.target.value)} /></label>
            <div className="form-row">
              <label>City<input required value={form.city} onChange={(event) => updateField('city', event.target.value)} /></label>
              <label>State<input required value={form.state} onChange={(event) => updateField('state', event.target.value)} /></label>
            </div>
            <div className="form-row">
              <label>PIN code<input required inputMode="numeric" maxLength={6} value={form.pin} onChange={(event) => updateField('pin', event.target.value.replace(/\D/g, ''))} /></label>
              <label>Address type<select value={form.type} onChange={(event) => updateField('type', event.target.value)}><option>Home</option><option>Work</option><option>Other</option></select></label>
            </div>
            <label>Landmark (optional)<input value={form.landmark} onChange={(event) => updateField('landmark', event.target.value)} /></label>
            <p className="maps-note">{import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Google Maps key detected. Map and Places UI require the Maps integration to be enabled by the application owner.' : 'Map selection is not configured. Manual address entry is available; no paid Maps APIs are enabled.'}</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="primary-button" type="submit">Save address</button>
            </div>
          </form>
        ) : (
          <>
            <div className="address-list">
              {addresses.length === 0 && <p className="empty-state compact">Add an address to get your order delivered.</p>}
              {addresses.map((address) => (
                <article className={`saved-address${selectedAddressId === address.id ? ' selected' : ''}`} key={address.id}>
                  <label className="address-choice">
                    <input type="radio" name="selected-address" checked={selectedAddressId === address.id} onChange={() => onSelect(address.id)} />
                    <span className="address-type-icon" aria-hidden="true">{address.type === 'Work' ? '▣' : '⌂'}</span>
                    <span><strong>{address.type}{address.isDefault && <em className="default-badge">Default</em>}</strong><span>{address.recipient} · +91 {address.phone}</span><span>{address.house}, {address.street}, {address.locality}, {address.city}, {address.state} {address.pin}{address.landmark ? ` · Near ${address.landmark}` : ''}</span></span>
                  </label>
                  <div className="address-actions">
                    {!address.isDefault && <button type="button" onClick={() => setDefault(address.id)}>Set default</button>}
                    <button type="button" onClick={() => beginEdit(address)}>Edit</button>
                    <button type="button" onClick={() => removeAddress(address.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="address-footer">
              <button className="secondary-button" type="button" onClick={beginAdd}>＋ Add new address</button>
              <button className="primary-button" type="button" onClick={finish}>{onCheckout ? 'Continue to checkout' : 'Done'}</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AddressSelector;
