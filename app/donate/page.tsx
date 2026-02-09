'use client';

import Link from 'next/link';

export default function DonatePage() {
  const features = [
    {
      icon: '🖥️',
      title: 'Server Costs',
      description: 'Keeping the platform fast and reliable for everyone'
    },
    {
      icon: '🔧',
      title: 'Development',
      description: 'Building new features and improvements constantly'
    },
    {
      icon: '🛡️',
      title: 'Security',
      description: 'Protecting your data and maintaining infrastructure'
    },
    {
      icon: '📈',
      title: 'Scaling',
      description: 'Growing to support thousands of profiles'
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
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

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all"
            >
              ← Back Home
            </Link>
          </div>

          {/* Main heading */}
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Support Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Help us build an even better platform for everyone. Every contribution makes a difference in keeping servers running, security tight, and features incredible.
            </p>
          </div>

          {/* Why donate section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {features.map((feature, idx) => (
              <div key={idx} className="glass p-6 text-center space-y-3">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Donation tiers */}
          <div className="mb-16">
            {/* Cash App Quick Link */}
            <div className="mb-8 text-center">
              <p className="text-gray-400 mb-4">Donate via Cash App:</p>
              <a
                href="https://cash.app/$AliShopper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                💵 Donate via Cash App
              </a>
            </div>
          </div>

          {/* Thank you message */}
          <div className="glass p-8 text-center space-y-4 max-w-2xl mx-auto pb-12">
            <div className="text-5xl">❤️</div>
            <h3 className="text-2xl font-bold text-white">
              Thank You for Supporting Us!
            </h3>
            <p className="text-gray-400">
              Whether you donate $5 or $500, every contribution helps us build something amazing together. You&apos;re not just supporting a platform&mdash;you&apos;re supporting a community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
