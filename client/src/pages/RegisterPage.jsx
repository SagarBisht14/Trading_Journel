import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from './LoginPage.jsx';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
  });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      navigate('/app');
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <AuthShell title="Create your journal" subtitle="Start with a secure account and a clean workspace.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Username</label>
          <input className="input" {...register('username', { required: true })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" minLength={8} {...register('password', { required: true })} />
        </div>
        <div>
          <label className="label">Admin Setup Secret</label>
          <input className="input" type="password" placeholder="Only for admin account creation" {...register('adminSecret')} />
          <p className="mt-1 text-xs text-slate-500">Leave blank for a normal client account.</p>
        </div>
        <input type="hidden" {...register('timezone')} />
        <button className="btn-primary w-full" disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" />
          Create account
        </button>
        <p className="text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-brand hover:text-sky-300">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
