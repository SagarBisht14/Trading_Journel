import { Camera, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { assetUrl } from '../services/api.js';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    currency: user?.currency || 'USD',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    darkMode: user?.darkMode ?? true,
    riskSettings: user?.riskSettings || { maxRiskPerTrade: 1, maxDailyLoss: 3, maxOpenRisk: 5 }
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [avatar, setAvatar] = useState(null);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const saveAvatar = async () => {
    if (!avatar) return;
    const data = new FormData();
    data.append('avatar', avatar);
    const response = await api.put('/auth/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    setUser(response.data.user);
    toast.success('Profile picture updated');
  };

  const savePassword = async () => {
    try {
      await api.put('/auth/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Profile" title="Account and risk settings" description="Manage profile picture, password, currency, timezone, dark mode, and risk limits." />
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="glass-panel rounded-lg p-5">
          <h2 className="section-title">Profile picture</h2>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-brand/10 text-2xl font-semibold text-brand">
              {user?.avatar ? <img src={assetUrl(user.avatar)} alt="Avatar" className="h-full w-full object-cover" /> : user?.username?.slice(0, 2)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <input className="input" type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0])} />
              <button className="btn-secondary mt-3" onClick={saveAvatar}><Camera className="h-4 w-4" />Upload</button>
            </div>
          </div>
        </section>
        <form onSubmit={saveProfile} className="glass-panel rounded-lg p-5">
          <h2 className="section-title">Preferences</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Username" value={form.username} onChange={(value) => setForm({ ...form, username: value })} />
            <Field label="Currency" value={form.currency} onChange={(value) => setForm({ ...form, currency: value })} />
            <Field label="Timezone" value={form.timezone} onChange={(value) => setForm({ ...form, timezone: value })} />
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
              <input type="checkbox" className="accent-brand" checked={Boolean(form.darkMode)} onChange={(event) => setForm({ ...form, darkMode: event.target.checked })} />
              Dark Mode
            </label>
            {['maxRiskPerTrade', 'maxDailyLoss', 'maxOpenRisk'].map((key) => (
              <Field
                key={key}
                label={key.replace(/([A-Z])/g, ' $1')}
                type="number"
                value={form.riskSettings?.[key]}
                onChange={(value) => setForm({ ...form, riskSettings: { ...form.riskSettings, [key]: value } })}
              />
            ))}
          </div>
          <button className="btn-primary mt-5"><Save className="h-4 w-4" />Save profile</button>
        </form>
        <section className="glass-panel rounded-lg p-5 xl:col-span-2">
          <h2 className="section-title">Password</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Current password" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} />
            <Field label="New password" type="password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} />
          </div>
          <button className="btn-secondary mt-5" onClick={savePassword}>Update password</button>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="label capitalize">{label}</label>
      <input className="input" value={value || ''} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}
