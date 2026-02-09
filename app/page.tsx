'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [mode, setMode] = useState<'claim' | 'login'>('claim');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const router = useRouter();

  const checkAvailability = async (value: string) => {
    if (value.length < 3) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/check/${value}`);
      const data = await res.json();
      setAvailable(data.data?.available || false);
    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(value);
    setError('');
    
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => checkAvailability(value), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailable(null);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to claim username');
        return;
      }

      // Store token locally
      localStorage.setItem(`token_${username}`, data.data.token);
      
      // Redirect to success page with token
      router.push(`/claim/success?username=${username}&token=${data.data.token}`);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || token.length < 10) {
      setError('Please enter a valid token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting to login with token:', token.substring(0, 10) + '...');
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok) {
        setError(data.error || 'Invalid token');
        setLoading(false);
        return;
      }

      // Redirect to editor with token
      const username = data.data?.username;
      if (!username) {
        setError('Could not find profile');
        setLoading(false);
        return;
      }

      // Store token locally
      localStorage.setItem(`token_${username}`, token);
      
      router.push(`/edit/${username}?token=${token}`);
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      {/* Background particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-2xl w-full space-y-8 fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text">
            Claim Your Space
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Create your profile in seconds. No sign-up. 100% free.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-black/30 rounded-xl glass">
          <button
            onClick={() => {
              setMode('claim');
              setError('');
              setToken('');
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'claim'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white glow-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Claim Username
          </button>
          <button
            onClick={() => {
              setMode('login');
              setError('');
              setUsername('');
              setAvailable(null);
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white glow-purple'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login with Token
          </button>
        </div>

        {/* Claim form */}
        {mode === 'claim' ? (
        <div className="glass p-8 space-y-6">
          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Choose your username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="yourname"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
                {username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checking ? (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : available === true ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : available === false ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                )}
              </div>
              {username && (
                <p className="mt-2 text-sm text-gray-400">
                  Your profile: <span className="text-purple-400">{window.location.host}/{username}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || username.length < 3 || available === false}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 glow-purple"
            >
              {loading ? 'Claiming...' : 'Claim Username'}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">🚀</div>
                <div className="text-sm text-gray-400 mt-1">No Sign-up</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">💎</div>
                <div className="text-sm text-gray-400 mt-1">100% Free</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">⚡</div>
                <div className="text-sm text-gray-400 mt-1">Instant Setup</div>
              </div>
            </div>
          </div>
        </div>
        ) : (
        <div className="glass p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your token
              </label>
              <textarea
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                placeholder="Paste your 64-character token here..."
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none h-32 font-mono text-sm"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-400">
                Your token is like a password. Keep it safe!
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 glow-purple"
            >
              {loading ? 'Logging in...' : 'Access Profile'}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-700">
            <div className="text-center text-sm text-gray-400">
              <p>💡 Your token was provided when you claimed your username</p>
              <p className="mt-1">Lost your token? You'll need to claim a new username</p>
            </div>
          </div>
        </div>
        )}

        {/* Features */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center mb-4">What you get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Custom profile page</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Social links & badges</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Custom colors & themes</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Image hosting</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Profile analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cool effects & animations</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-3">
          <p>No email required • No passwords • No BS</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/donate"
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              ❤️ Support Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
