import { useState } from 'react';
import { isValidIndianMobileNumber, isValidIndianPinCode } from '../utils/shop';

const MOCK_OTP = '123456';

function AuthModal({ accounts, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState({ house: '', street: '', locality: '', city: '', state: '', pin: '' });
  const [error, setError] = useState('');

  const submitMobile = (event) => {
    event.preventDefault();
    setError('');
    if (!isValidIndianMobileNumber(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    const existingAccount = accounts.find((account) => account.mobile === mobile);
    if (mode === 'login' && !existingAccount) {
      setError('We could not find an account for this number. Choose Register to get started.');
      return;
    }
    if (mode === 'register' && existingAccount) {
      setError('An account already exists for this number. Choose Login instead.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim() || Object.values(address).some((value) => !value.trim())) {
        setError('Complete your name and default delivery address to continue.');
        return;
      }
      if (!isValidIndianPinCode(address.pin)) {
        setError('Enter a valid 6-digit PIN code.');
        return;
      }
    }
    setStep('otp');
  };

  const verifyOtp = (event) => {
    event.preventDefault();
    const otp = new FormData(event.currentTarget).get('otp');
    if (otp !== MOCK_OTP) {
      setError('That code does not match. For this development demo, use 123456.');
      return;
    }
    onAuthenticated({
      mobile,
      name: mode === 'register' ? name.trim() : undefined,
      defaultAddress: mode === 'register' ? address : undefined,
      isNew: mode === 'register',
    });
  };

  const setAddressField = (field, value) => setAddress((current) => ({ ...current, [field]: value }));

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="dialog-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <div className="auth-brand-mark" aria-hidden="true">O</div>
        <p className="eyebrow">Welcome to the neighbourhood</p>
        <h2 id="auth-title">{step === 'otp' ? 'Verify your number' : mode === 'login' ? 'Login to ORDER IT' : 'Create your account'}</h2>
        <p className="dialog-description">{step === 'otp' ? `Enter the 6-digit code for +91 ${mobile}` : 'Quick deliveries start with your mobile number.'}</p>
        {step === 'details' ? (
          <>
            <div className="auth-tabs" role="tablist" aria-label="Account options">
              <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Login</button>
              <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Register</button>
            </div>
            <form className="dialog-form" onSubmit={submitMobile}>
              {mode === 'register' && (
                <>
                  <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
                  <p className="form-section-label">Default delivery address</p>
                  <label>House / flat number<input required value={address.house} onChange={(event) => setAddressField('house', event.target.value)} placeholder="e.g. Flat 4B" /></label>
                  <label>Building / street<input required value={address.street} onChange={(event) => setAddressField('street', event.target.value)} placeholder="Street and building" /></label>
                  <label>Area / locality<input required value={address.locality} onChange={(event) => setAddressField('locality', event.target.value)} placeholder="Area or locality" /></label>
                  <div className="form-row">
                    <label>City<input required value={address.city} onChange={(event) => setAddressField('city', event.target.value)} placeholder="City" /></label>
                    <label>State<input required value={address.state} onChange={(event) => setAddressField('state', event.target.value)} placeholder="State" /></label>
                  </div>
                  <label>PIN code<input required inputMode="numeric" maxLength={6} value={address.pin} onChange={(event) => setAddressField('pin', event.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" /></label>
                </>
              )}
              <label>Mobile number
                <span className="phone-input"><span>🇮🇳 +91</span><input required autoComplete="tel-national" inputMode="numeric" maxLength={10} value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, ''))} placeholder="10-digit number" /></span>
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button full-width" type="submit">Continue with OTP <span aria-hidden="true">→</span></button>
            </form>
          </>
        ) : (
          <form className="dialog-form" onSubmit={verifyOtp}>
            <div className="mock-notice"><strong>Development mock mode</strong><span>No OTP provider is connected. Use <b>123456</b> to test this local demo.</span></div>
            <label>One-time password<input name="otp" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="Enter 123456" /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button full-width" type="submit">Verify & continue <span aria-hidden="true">→</span></button>
            <button className="text-button centered-button" type="button" onClick={() => { setStep('details'); setError(''); }}>Change mobile number</button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AuthModal;
