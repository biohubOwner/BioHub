'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { detectSocialPlatform } from '@/lib/social';
import * as Si from 'react-icons/si';

export default function EditProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = params.username as string;
  const tokenFromUrl = searchParams.get('token');
  
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicAutoplay, setMusicAutoplay] = useState(false);
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#a855f7');
  const [layout, setLayout] = useState('default');
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  // Define loadProfile before useEffect so it's available
  const loadProfile = async (username: string, tok: string) => {
    try {
      console.log('Loading profile for username:', username, 'with token:', tok);
      const res = await fetch(`/api/update/${username}?token=${tok}`);
      const data = await res.json();
      
      console.log('Load response:', data);
      
      if (!res.ok) {
        setError(data.error || 'Failed to load profile');
        setLoading(false);
        return;
      }
      
      const prof = data.data;
      console.log('Setting profile from response:', prof);
      
      setProfile(prof);
      setDisplayName(prof.displayName || username);
      setBio(prof.bio || '');
      setAvatar(prof.avatar || '');
      setBackgroundImage(prof.backgroundImage || '');
      setMusicUrl(prof.musicUrl || '');
      setMusicTitle(prof.musicTitle || '');
      setMusicAutoplay(prof.musicAutoplay || false);
      setWelcomeEnabled(prof.welcomeScreen?.enabled || false);
      setWelcomeTitle(prof.welcomeScreen?.title || '');
      setPrimaryColor(prof.colors?.primary || '#a855f7');
      setLayout(prof.layout || 'default');
      setSocialLinks(prof.socialLinks || []);
      
      console.log('Profile state updated');
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get token from URL or local storage
    const tok = tokenFromUrl || localStorage.getItem(`token_${username}`);
    
    console.log('useEffect triggered - username:', username, 'tokenFromUrl:', tokenFromUrl, 'tok:', tok);
    
    if (!tok) {
      console.log('No token found');
      setError('No access token found. Please use the link from your claim page.');
      setLoading(false);
      return;
    }
    
    if (!username) {
      console.log('Username not yet loaded from params');
      return;
    }
    
    console.log('Setting token and loading profile');
    setToken(tok);
    loadProfile(username, tok);
    
    // Timeout after 10 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error('Profile load timeout');
        setError('Failed to load profile - request timed out');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [username, tokenFromUrl]);

  const handleSave = async () => {
    if (!token) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        token,
        displayName,
        bio,
        avatar,
        backgroundImage,
        musicUrl,
        musicTitle,
        musicAutoplay,
        welcomeScreen: {
          enabled: welcomeEnabled,
          title: welcomeTitle,
          buttonText: 'Enter',
        },
        colors: {
          primary: primaryColor,
        },
        layout,
        socialLinks,
      };

      console.log('Saving updates:', updates);

      const res = await fetch(`/api/update/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      console.log('Save response:', data);

      if (!res.ok) {
        setError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }

      setSuccess('✅ Profile saved successfully! All changes have been saved.');
      
      // Reload profile after successful save to confirm
      setTimeout(() => {
        loadProfile(username, token);
      }, 500);
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Network error. Please try again.');
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { id: Date.now().toString(), platform: '', url: '', display: true }]);
  };

  const updateSocialLink = (id: string, field: string, value: string) => {
    setSocialLinks(socialLinks.map(link => {
      if (link.id === id) {
        const updated = { ...link, [field]: value };
        // Auto-detect platform from URL
        if (field === 'url' && value) {
          const detected = detectSocialPlatform(value);
          if (detected) {
            updated.platform = detected.platform;
          }
        }
        return updated;
      }
      return link;
    }));
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid #a855f7', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ maxWidth: '448px', width: '100%', backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171', marginBottom: '8px' }}>Access Denied</h1>
          <p style={{ color: '#d1d5db', marginBottom: '24px' }}>{error}</p>
          <Link
            href="/"
            style={{ display: 'inline-block', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '24px', paddingRight: '24px', backgroundColor: '#9333ea', color: 'white', fontWeight: '500', borderRadius: '8px', textDecoration: 'none', transition: 'all' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="glass p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Edit Profile</h1>
            <p className="text-gray-400 mt-1">@{username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/${username}`}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
            >
              👀 View Profile
            </Link>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="glass p-4 bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="glass p-4 bg-green-500/10 border border-green-500/30 text-green-400">
            {success}
          </div>
        )}

        {/* Editor sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="glass p-6 space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                placeholder="Tell people about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="https://i.imgur.com/yourimage.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Upload to imgur.com or use any direct image link</p>
              {avatar && (
                <div className="mt-2">
                  <img src={avatar} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>

          {/* Customization */}
          <div className="glass p-6 space-y-4">
            <h2 className="text-xl font-semibold">Customization</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Layout Style
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="default">Default</option>
                <option value="centered">Centered</option>
                <option value="minimal">Minimal</option>
                <option value="split">Split Screen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Image URL
              </label>
              <input
                type="url"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="https://i.imgur.com/background.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Add a custom background image for your profile</p>
            </div>
          </div>
        </div>

        {/* Music Player */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-xl font-semibold">🎵 Background Music</h2>
          <p className="text-sm text-gray-400">Add music that plays when visitors view your profile (like guns.lol)</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Music URL (MP3, YouTube, SoundCloud, etc.)
            </label>
            <input
              type="url"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="https://example.com/song.mp3 or YouTube URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Song Title (Optional)
            </label>
            <input
              type="text"
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="Song Name - Artist"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoplay"
              checked={musicAutoplay}
              onChange={(e) => setMusicAutoplay(e.target.checked)}
              className="w-5 h-5 rounded bg-black/50 border-purple-500/30"
            />
            <label htmlFor="autoplay" className="text-sm text-gray-300">
              Autoplay music on profile load
            </label>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-xl font-semibold">🌟 Welcome Screen</h2>
          <p className="text-sm text-gray-400">Show a "click to enter" screen before your profile (like guns.lol)</p>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="welcomeEnabled"
              checked={welcomeEnabled}
              onChange={(e) => setWelcomeEnabled(e.target.checked)}
              className="w-5 h-5 rounded bg-black/50 border-purple-500/30"
            />
            <label htmlFor="welcomeEnabled" className="text-sm text-gray-300">
              Enable welcome screen
            </label>
          </div>

          {welcomeEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Welcome Title (Optional)
              </label>
              <input
                type="text"
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="Welcome to my profile..."
              />
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Social Links</h2>
            <button
              onClick={addSocialLink}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
            >
              + Add Link
            </button>
          </div>

          <div className="space-y-3">
            {socialLinks.map((link) => {
              const detected = detectSocialPlatform(link.url);
              const iconName = detected?.iconName || 'SiLink';
              const color = detected?.color || '#999999';
              
              // Get the actual icon component from react-icons
              const IconComponent = (Si as any)[iconName];
              
              return (
                <div key={link.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-lg text-xl" style={{ color }}>
                    {IconComponent ? <IconComponent /> : '🔗'}
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                    placeholder="https://youtube.com/@yourname"
                    className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                    placeholder="Platform"
                    className="w-32 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => removeSocialLink(link.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
            
            {socialLinks.length === 0 && (
              <p className="text-center text-gray-500 py-8">No social links yet. Click "Add Link" to get started.</p>
            )}
          </div>
        </div>

        {/* Analytics */}
        {profile?.analytics && (
          <div className="glass p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400">{profile.analytics.views}</div>
                <div className="text-sm text-gray-400 mt-1">Profile Views</div>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-400">
                  {Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-400 mt-1">Days Active</div>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-green-500/30">
                <div className="text-3xl font-bold text-green-400">
                  {profile.socialLinks?.length || 0}
                </div>
                <div className="text-sm text-gray-400 mt-1">Social Links</div>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="glass p-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 glow-purple"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>🔒 Your edit token is stored securely in your browser</p>
          <p>⏰ Last updated: {new Date(profile.lastUpdated).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
