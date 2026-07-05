import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthShell } from './LoginPage.jsx';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, values);
      localStorage.setItem('tradepilot_token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Password updated');
      navigate('/app');
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <AuthShell title="Choose a new password" subtitle="Your new password must be at least 8 characters.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input className="input" type="password" minLength={8} {...register('password', { required: true })} />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>Update password</button>
      </form>
    </AuthShell>
  );
}
