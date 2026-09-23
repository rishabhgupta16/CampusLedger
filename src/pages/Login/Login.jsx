import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-light-base dark:bg-surface-dark-base text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log in to continue tracking your campus finances
          </p>
        </div>

        <Card subtle3D className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                autoFocus
                autoComplete="email"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.email
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.password
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                } text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors`}
              />
              {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={LogIn}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full font-bold"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          New to CampusLedger?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
