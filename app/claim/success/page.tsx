'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClaimSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = searchParams.get('username');
    const tok = searchParams.get('token');
    
    if (!user || !tok) {
      router.push('/');
      return;
    }
    
    setUsername(user);
    setToken(tok);
  }, [searchParams, router]);

  const downloadToken = () => {
    const data = {
      username,
      token,
      editUrl: `${window.location.origin}/edit/${username}?token=${token}`,
      profileUrl: `${window.location.origin}/${username}`,
      claimedAt: new Date().toISOString(),
      warning: '⚠️ IMPORTANT: Keep this file safe! You cannot recover your profile without this token.',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-token.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloaded(true);
  };

  const copyEditUrl = () => {
    const editUrl = `${window.location.origin}/edit/${username}?token=${token}`;
    navigator.clipboard.writeText(editUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToEditor = () => {
    router.push(`/edit/${username}?token=${token}`);
  };

  if (!username || !token) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6 fade-in">
        {/* Success message */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-float">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Username Claimed!
          </h1>
          <p className="text-xl text-gray-300">
            Welcome, <span className="text-purple-400 font-semibold">{username}</span>
          </p>
        </div>

        {/* Critical: Save token */}
        <div className="glass p-6 space-y-4 border-2 border-yellow-500/50">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-yellow-400 mb-2">
                Save Your Access Token Now!
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                This is your ONLY way to edit your profile. We don't have passwords or email recovery. 
                If you lose this token, you lose access to your profile forever.
              </p>
              
              <button
                onClick={downloadToken}
                className={`w-full py-3 px-6 font-semibold rounded-lg transition-all transform ${
                  downloaded
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700 animate-pulse'
                } text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              >
                {downloaded ? '✓ Token Downloaded' : '📥 Download Token File'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit URL */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-semibold text-lg">Your Editor Link</h3>
          <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
            <code className="text-sm text-purple-400 break-all">
              {window.location.origin}/edit/{username}?token={token}
            </code>
          </div>
          <button
            onClick={copyEditUrl}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <p className="text-xs text-gray-400">
            Bookmark this link or save it somewhere safe. You'll need it to edit your profile.
          </p>
        </div>

        {/* Profile URL */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-semibold text-lg">Your Public Profile</h3>
          <div className="bg-black/50 p-4 rounded-lg border border-blue-500/30">
            <code className="text-sm text-blue-400 break-all">
              {window.location.origin}/{username}
            </code>
          </div>
          <Link
            href={`/${username}`}
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-center"
          >
            👀 View Profile
          </Link>
        </div>

        {/* Warning */}
        {!downloaded && (
          <div className="glass p-4 bg-red-500/10 border-2 border-red-500/50">
            <div className="flex items-center space-x-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">
                You haven't downloaded your token yet. Please save it before continuing!
              </span>
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={goToEditor}
          disabled={!downloaded}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 glow-purple"
        >
          {downloaded ? '✨ Start Editing Your Profile' : '🔒 Download Token First'}
        </button>

        {/* Storage info */}
        <div className="text-center text-sm text-gray-500">
          <p>Token is also saved in your browser's local storage as a backup</p>
        </div>
      </div>
    </div>
  );
}
