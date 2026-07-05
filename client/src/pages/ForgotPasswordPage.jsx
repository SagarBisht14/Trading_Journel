import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { AuthShell } from './LoginPage.jsx';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [resetUrl, setResetUrl] = useState('');

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/forgot-password', values);
      setResetUrl(data.resetUrl || '');
      toast.success(data.message);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Generate a secure reset link for your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>Send reset link</button>
      </form>
      {resetUrl && (
        <div className="mt-4 rounded-lg border border-brand/20 bg-brand/10 p-3 text-sm text-sky-100">
          Local reset link: <a className="underline" href={resetUrl}>{resetUrl}</a>
        </div>
      )}
    </AuthShell>
  );
}
