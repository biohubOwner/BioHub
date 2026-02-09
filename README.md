# Modern Profile Website

A modern, dark-theme profile website inspired by guns.lol where users can claim usernames and create stunning profiles without any sign-up or authentication system.

## 🌟 Features

### Core Functionality
- **No Sign-up Required**: Claim a username instantly without email, password, or account creation
- **Token-Based Editing**: Secure edit tokens for profile management
- **Public Profiles**: Share your profile at `yoursite.com/username`
- **First-Come, First-Served**: Username claiming with real-time availability checking

### Profile Customization
- ✨ Custom colors and themes
- 🎨 Multiple layout styles (default, centered, minimal, split)
- 🔗 Social links and badges
- 📝 Bio and display name
- 🖼️ Custom avatar images
- 🌄 Custom background images
- 🎵 Background music player (like guns.lol)
- 🎭 Welcome screen with "click to enter" effect
- 📊 Profile analytics (views, activity)
- 🎯 Custom widgets

### Security & Protection
- 🔒 Secure 64-character random edit tokens
- 🚫 Token-protected editing (no token = no access)
- ⏰ Rate limiting on claims, checks, and updates
- 🗑️ Auto-deletion of inactive profiles
- 💾 Automatic token backup system
- 🛡️ IP-based abuse prevention

### User Experience
- 🌙 Modern dark theme with glassmorphism
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- ⚡ Lightning-fast performance
- 🎭 Cursor and background effects
- 🔄 Real-time username availability checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or compatible runtime)
- A Vercel account (for deployment and KV storage)

### Local Development

1. **Clone and Install**
   ```bash
   cd "Big Project"
   npm install
   ```

2. **Set Up Vercel KV**
   - Create a new project on [Vercel](https://vercel.com)
   - Add a Vercel KV database to your project
   - Copy the environment variables from your Vercel dashboard

3. **Configure Environment**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit .env.local with your Vercel KV credentials
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your Vercel KV database
   - Environment variables are automatically configured
   - Deploy!

Your site will be live at `your-project.vercel.app`

## 🏗️ Project Structure

```
.
├── app/
│   ├── api/                    # API routes (serverless functions)
│   │   ├── claim/              # Claim username
│   │   ├── check/[username]/   # Check availability
│   │   ├── profile/[username]/ # Get public profile
│   │   └── update/[username]/  # Update profile (token required)
│   ├── claim/success/          # Post-claim success page
│   ├── edit/[username]/        # Profile editor (token required)
│   ├── [username]/             # Public profile page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing/claim page
├── lib/
│   ├── db.ts                   # Database operations (Vercel KV)
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
└── ...config files
```

## 🔧 Configuration

### Rate Limits (in `lib/db.ts`)

```typescript
// Username claims: 3 per hour per IP
checkRateLimit(ip, 'claim', 3, 60 * 60 * 1000)

// Availability checks: 30 per minute per IP
checkRateLimit(ip, 'check', 30, 60 * 1000)

// Profile updates: 30 per minute per IP
checkRateLimit(ip, 'update', 30, 60 * 1000)
```

### Auto-Deletion Thresholds

```typescript
// Profiles never edited: deleted after 7 days
// Inactive profiles: deleted after 180 days
cleanupInactiveProfiles(7, 180)
```

## 🎨 Customization

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Components**: Create reusable components in `components/`
3. **Styles**: Extend Tailwind config in `tailwind.config.ts`
4. **Types**: Add TypeScript types in `types/index.ts`

### Themes & Colors

Edit `app/globals.css` and `tailwind.config.ts` to customize:
- Color schemes
- Animations
- Effects (glow, particles, etc.)
- Glassmorphism styles

## 📝 API Reference

### POST `/api/claim`
Claim a new username.

**Request:**
```json
{
  "username": "myusername"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "myusername",
    "token": "secure_64_char_token",
    "editUrl": "https://yoursite.com/edit/myusername?token=...",
    "profileUrl": "https://yoursite.com/myusername"
  }
}
```

### GET `/api/check/:username`
Check username availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

### GET `/api/profile/:username`
Get public profile data.

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "myusername",
    "displayName": "My Name",
    "bio": "My bio",
    "colors": { "primary": "#a855f7" },
    "socialLinks": [...],
    "analytics": { "views": 100 }
  }
}
```

### POST `/api/update/:username`
Update profile (requires token).

**Request:**
```json
{
  "token": "your_edit_token",
  "displayName": "New Name",
  "bio": "New bio",
  "colors": { "primary": "#ff0000" },
  "socialLinks": [...]
}
```

## 🔒 Security Features

1. **Unguessable Tokens**: 64-character random tokens using nanoid
2. **No Recovery**: Lost tokens cannot be recovered (by design)
3. **Token Validation**: All edits require valid token
4. **Rate Limiting**: Prevents abuse and bot attacks
5. **Normalized Usernames**: Case-insensitive, trimmed
6. **Reserved Usernames**: System routes are protected
7. **Input Validation**: All inputs are validated and sanitized

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel Serverless Functions
- **Token Generation**: nanoid

## 📊 Database Schema

### Profile
```typescript
{
  username: string;           // Unique identifier
  token: string;              // Edit token (never exposed publicly)
  createdAt: number;          // Unix timestamp
  lastUpdated: number;        // Unix timestamp
  displayName?: string;       // Display name
  bio?: string;               // User bio
  colors?: { primary, secondary, accent, background };
  fonts?: { heading, body };
  layout?: 'default' | 'centered' | 'minimal' | 'split';
  effects?: { cursorEffect, backgroundEffect, typewriterBio };
  socialLinks?: [...];
  badges?: [...];
  widgets?: [...];
  images?: [...];
  analytics?: { views, lastViewed };
}
```

## 🤝 Contributing

This is a complete, production-ready project. Feel free to:
- Fork and customize for your needs
- Add new features
- Improve existing functionality
- Report issues

## 📄 License

This project is provided as-is for your use. Modify and deploy as you wish.

## 🎯 Roadmap

Potential future enhancements:
- [ ] More layout options
- [ ] Advanced badge system
- [ ] Widget integrations (Spotify, Discord, GitHub, etc.)
- [ ] Custom domain support
- [ ] Profile themes marketplace
- [ ] Advanced analytics
- [ ] Profile export/import

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section below
2. Review the API documentation
3. Check Vercel KV connection settings

### Troubleshooting

**"npx not found"**: Install Node.js from nodejs.org

**"Failed to connect to KV"**: Check your environment variables in `.env.local`

**"Rate limit exceeded"**: Wait a few minutes and try again

**"Username already taken"**: Choose a different username

**"Invalid token"**: Use the correct token from your claim page

## 🌐 Environment Variables

Required for production:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

All are automatically configured when using Vercel KV.

---

**Built with ❤️ for a sign-up-free web**

No accounts. No passwords. No BS. Just claim and create.
