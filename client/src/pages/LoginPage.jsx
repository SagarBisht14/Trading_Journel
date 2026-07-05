import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate('/app');
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Login to review your edge.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" {...register('password', { required: true })} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-brand hover:text-sky-300">Forgot password?</Link>
          <Link to="/register" className="text-slate-400 hover:text-white">Create account</Link>
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          <LogIn className="h-4 w-4" />
          Login
        </button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src="/hero-trading-workstation.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-ink" />
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-semibold text-white">TradePilot Journal</span>
          </Link>
          <div className="glass-panel rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
