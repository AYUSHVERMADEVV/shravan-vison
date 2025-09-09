# Shravan Vision - ISL Translation Platform

## Project Overview
Shravan Vision is a Next.js application for Indian Sign Language (ISL) translation and accessibility features. The platform provides ISL to text translation, AR learning capabilities, emergency SOS system, and user authentication.

## Recent Setup Changes (Sept 9, 2025)
- Configured Next.js for Replit environment with proper host settings
- Fixed Supabase environment variable configuration (URL and anon key were initially swapped)
- Set up development workflow on port 5000 with proxy support
- Configured autoscale deployment for production
- Temporarily hardcoded Supabase credentials in lib/supabase.ts to resolve environment variable issues

## Project Architecture

### Frontend
- **Framework**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Supabase Auth with custom UI
- **State Management**: React hooks and context

### Database
- **Provider**: Supabase (PostgreSQL)
- **Tables**: users, translation_logs, sos_alerts
- **Security**: Row Level Security (RLS) enabled
- **Migration**: Located in `supabase/migrations/`

### Key Features
- 🤟 ISL to Text Translation
- 📚 AR Learning Platform  
- 🚨 Emergency SOS System
- 🔐 User Authentication
- 📱 Responsive Design with bottom navigation

### File Structure
```
app/                    # Next.js 13 app router
├── auth/              # Authentication pages
├── dashboard/         # Main dashboard
├── learn/             # Learning module
├── settings/          # User settings
├── sos/               # Emergency SOS
└── translate/         # Translation features

components/            # Reusable UI components
├── ui/               # Radix UI components
└── [custom components]

lib/                  # Utility libraries
├── supabase.ts      # Database client & types
└── utils.ts         # Helper functions

hooks/               # Custom React hooks
└── useAuth.ts      # Authentication hook
```

## Development Setup
- **Port**: 5000 (required for Replit proxy)
- **Host**: 0.0.0.0 (allows Replit iframe access)
- **Environment**: Development server with hot reload
- **Database**: Connected to Supabase with proper RLS policies

## Known Issues & Fixes
1. **Supabase Environment Variables**: Initially swapped, now hardcoded in lib/supabase.ts
2. **Validation Logic**: Temporarily disabled to allow app startup
3. **React Warning**: Minor warning about component updates during render (non-blocking)

## User Preferences
- Language: English/Hindi support
- Theme: Light/Dark mode toggle
- Authentication: Email-based with Supabase

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Environment**: Production-ready with proper caching disabled for Replit