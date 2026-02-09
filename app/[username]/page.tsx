'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getYouTubeEmbedUrl, detectSocialPlatform } from '@/lib/social';
import * as Si from 'react-icons/si';

export default function PublicProfile() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${username}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Profile not found');
        setLoading(false);
        return;
      }

      setProfile(data.data);
      setShowWelcome(data.data.welcomeScreen?.enabled || false);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const enterProfile = () => {
    setShowWelcome(false);
    if (profile?.musicUrl && profile?.musicAutoplay) {
      playMusic();
    }
  };

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  const toggleMusic = () => {
    if (musicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 text-center space-y-4">
          <div className="text-5xl">😞</div>
          <h1 className="text-2xl font-bold text-red-400">Profile Not Found</h1>
          <p className="text-gray-300">
            {error || 'This username hasn\'t been claimed yet.'}
          </p>
          <Link
            href="/"
            className="inline-block py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
          >
            Claim This Username
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = profile.colors?.primary || '#a855f7';
  const displayName = profile.displayName || username;
  const bio = profile.bio || 'No bio yet.';
  const socialLinks = profile.socialLinks || [];
  const avatarUrl = profile.avatar;
  const backgroundImage = profile.backgroundImage;

  // Welcome screen
  if (showWelcome) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: backgroundImage ? 'transparent' : '#0a0a0f',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Particles */}
        <div className="particles">
          {[...Array(30)].map((_, i) => (
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

        {/* Content */}
        <div className="relative z-10 text-center space-y-8 fade-in">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-32 h-32 mx-auto rounded-full object-cover border-4 animate-glow"
              style={{ borderColor: primaryColor }}
            />
          ) : (
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-bold text-white animate-glow"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`,
                borderWidth: '4px',
                borderColor: primaryColor,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Welcome text */}
          <div className="space-y-4">
            {profile.welcomeScreen?.title ? (
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {profile.welcomeScreen.title}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                {displayName}&apos;s Profile
              </h1>
            )}
            
            <button
              onClick={enterProfile}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 text-white font-semibold rounded-full transition-all transform hover:scale-105 cursor-pointer animate-pulse"
              style={{ borderColor: primaryColor }}
            >
              click to enter...
            </button>
          </div>

          {/* View count */}
          {profile.analytics && (
            <p className="text-sm text-gray-400">
              👁️ {profile.analytics.views} views
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: backgroundImage ? 'transparent' : '#0a0a0f',
      }}
    >
      {/* Background overlay */}
      {backgroundImage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      )}

      {/* Music player */}
      {profile.musicUrl && (() => {
        const youtubeEmbedUrl = getYouTubeEmbedUrl(profile.musicUrl);
        
        if (youtubeEmbedUrl) {
          // YouTube embed player
          return (
            <div className="fixed top-4 right-4 z-50 glass p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="text-red-500">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                  {profile.musicTitle || 'YouTube Music'}
                </div>
              </div>
              <iframe
                src={youtubeEmbedUrl}
                allow="autoplay; encrypted-media"
                className="hidden"
              />
            </div>
          );
        }
        
        // Regular audio player
        return (
          <>
            <audio 
              ref={audioRef} 
              src={profile.musicUrl} 
              loop 
              onEnded={() => setMusicPlaying(false)}
            />
            
            <div className="fixed top-4 right-4 z-50 glass p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMusic}
                  className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-full transition-all"
                >
                  {musicPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white truncate">
                    {profile.musicTitle || 'Background Music'}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={musicVolume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* Background effects */}
      {!backgroundImage && (
        <div className="particles">
          {[...Array(15)].map((_, i) => (
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
      )}

      <div className="max-w-4xl mx-auto p-4 py-12 space-y-8 relative z-10">
        {/* Profile Header */}
        <div className="glass p-8 text-center space-y-6 fade-in">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-32 h-32 mx-auto rounded-full object-cover border-4"
              style={{
                borderColor: primaryColor,
                boxShadow: `0 0 40px ${primaryColor}50`,
              }}
            />
          ) : (
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`,
                boxShadow: `0 0 40px ${primaryColor}50`,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name and Username */}
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
              {displayName}
            </h1>
            <p className="text-xl text-gray-400">@{username}</p>
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {bio}
            </p>
          )}

          {/* Social Links - Icons Only */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {socialLinks.map((link: any) => {
                const detected = detectSocialPlatform(link.url);
                const iconName = detected?.iconName || 'SiLink';
                const color = detected?.color || primaryColor;
                
                // Get the actual icon component from react-icons
                const IconComponent = (Si as any)[iconName];
                
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={detected?.platform || link.platform}
                    className="glass p-3 rounded-full hover:scale-110 transition-all flex items-center justify-center"
                    style={{
                      borderColor: `${color}40`,
                    }}
                  >
                    {IconComponent ? (
                      <IconComponent className="text-2xl" style={{ color }} />
                    ) : (
                      <span className="text-2xl">🔗</span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-6 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {profile.analytics?.views || 0}
            </div>
            <div className="text-sm text-gray-400 mt-1">Profile Views</div>
          </div>
          <div className="glass p-6 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-400 mt-1">Days Active</div>
          </div>
          <div className="glass p-6 text-center">
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>
              {socialLinks.length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Social Links</div>
          </div>
        </div>

        {/* Widgets/Custom Content Section */}
        {profile.widgets && profile.widgets.length > 0 && (
          <div className="space-y-4">
            {profile.widgets.map((widget: any) => (
              <div key={widget.id} className="glass p-6">
                <h3 className="text-xl font-semibold mb-4">Widget: {widget.type}</h3>
                <p className="text-gray-400">Custom widget content here</p>
              </div>
            ))}
          </div>
        )}

        {/* Images Gallery */}
        {profile.images && profile.images.length > 0 && (
          <div className="glass p-6">
            <h3 className="text-xl font-semibold mb-4">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square bg-black/50 rounded-lg border border-purple-500/30"
                >
                  {/* Image placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    🖼️
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="glass p-6 text-center space-y-4">
          <p className="text-gray-400">
            Want your own profile page?
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 glow-purple"
          >
            🚀 Claim Your Username
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            100% Free • No Sign-up Required
          </p>
        </div>
      </div>
    </div>
  );
}
