import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import FormInput from '../components/common/FormInput';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (formData.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = 'Enter a valid email address';
    if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData.name.trim(), formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass w-full max-w-md rounded-2xl p-8 shadow-card"
      >
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-brand bg-clip-text text-3xl font-black text-transparent">
            🎵 Create Account
          </h1>
          <p className="mt-2 text-sm text-white/50">Start building your sound library</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            autoComplete="name"
          />
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-light hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;

















