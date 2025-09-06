# Shravan Vision - ISL Translation & Accessibility Platform

Shravan Vision is a comprehensive web application built with Next.js 14 that provides Indian Sign Language (ISL) translation and accessibility features. The platform uses AI-powered recognition to bridge communication barriers between sign language users and spoken language users.

## 🌟 Features

### Core Functionality
- **Real-time ISL Translation**: Convert between ISL gestures and English/Hindi text
- **Text-to-Speech**: Voice output for translated content using Web Speech API
- **Voice Recognition**: Input text using voice commands
- **Translation History**: Save and track all translations with Supabase database
- **AR Learning Module**: Interactive ISL learning cards with future AR integration
- **Emergency SOS System**: One-click emergency alerts with location tracking
- **User Authentication**: Secure login with email/password and Google OAuth
- **Dark/Light Theme**: Customizable appearance with theme persistence
- **Responsive Design**: Mobile-first design with bottom navigation for mobile devices

### Accessibility Features
- High contrast colors and readable fonts
- Large, touch-friendly buttons
- Screen reader friendly components
- Keyboard navigation support
- ARIA labels and semantic HTML

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Optimized for Vercel with static export

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Modern web browser with camera/microphone access

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd shravan-vision
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Run the migration file from `supabase/migrations/create_tables.sql`
3. This will create the required tables with proper RLS policies:
   - `users` - User profiles and preferences
   - `translation_logs` - Translation history
   - `sos_alerts` - Emergency alert records

### 4. Authentication Setup

1. In Supabase dashboard, go to Authentication → Settings
2. Configure the following:
   - Enable email confirmation (optional)
   - Add your domain to redirect URLs
   - Enable Google provider (optional):
     - Go to Auth → Providers → Google
     - Add your Google OAuth credentials

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build and Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Deploy to Other Platforms

The app is configured for static export and can be deployed to any static hosting service:

```bash
npm run build
# Upload the 'out' folder to your hosting service
```

## 📱 Usage Guide

### Getting Started

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Dashboard**: Access all features from the main dashboard
3. **Set Preferences**: Configure language and theme in Settings

### Translation Features

1. **Text Translation**: 
   - Enter text in the input box
   - Select translation direction (ISL ↔ English/Hindi)
   - Click translate to get results
   - Use voice input or text-to-speech features

2. **Gesture Recognition** (Coming Soon):
   - Click "Start Camera" to begin gesture detection
   - Position hands within camera view
   - AI will automatically detect and translate gestures

### Learning Module

1. Browse ISL cards by category
2. Click on any card to start learning
3. Track progress with the built-in progress system
4. AR features will be available in future updates

### Emergency SOS

1. Grant location permissions when prompted
2. Press the red SOS button in emergencies
3. Cancel within 5 minutes if triggered accidentally
4. View alert history in the SOS dashboard

## 🔧 Configuration

### Environment Variables

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization

- **Themes**: Modify colors in `tailwind.config.ts` and `globals.css`
- **Components**: All UI components are in `components/ui/`
- **Database Schema**: Extend tables in Supabase dashboard or create new migrations

## 🗂️ Project Structure

```
shravan-vision/
├── app/                      # Next.js 14 app directory
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main dashboard
│   ├── translate/            # Translation interface
│   ├── learn/                # AR learning module
│   ├── sos/                  # Emergency SOS system
│   ├── settings/             # User settings
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/               # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── BottomNavigation.tsx # Mobile navigation
│   ├── Sidebar.tsx          # Desktop sidebar
│   └── ProtectedRoute.tsx   # Authentication wrapper
├── hooks/                    # Custom React hooks
│   └── useAuth.ts           # Authentication hook
├── lib/                      # Utility functions
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Helper functions
├── supabase/migrations/      # Database migrations
└── public/                   # Static assets
```

## 🚧 Future Roadmap

### Phase 1 - AI Integration (In Progress)
- [ ] TensorFlow Lite integration for gesture recognition
- [ ] MediaPipe for hand tracking and pose estimation
- [ ] Real-time gesture detection and translation
- [ ] Improved translation accuracy with custom models

### Phase 2 - AR/VR Features
- [ ] ARCore integration for Android devices
- [ ] 3D hand gesture visualization
- [ ] Interactive AR learning experiences
- [ ] Virtual ISL instructor

### Phase 3 - Advanced Features
- [ ] Machine learning model training interface
- [ ] Community-driven gesture database
- [ ] Video call integration with real-time translation
- [ ] Offline mode with cached models

### Phase 4 - Accessibility Enhancements
- [ ] Advanced voice commands
- [ ] Haptic feedback for mobile devices
- [ ] Integration with assistive technologies
- [ ] Multi-language support expansion

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and FAQ sections
- Contact our support team

## 🙏 Acknowledgments

- Supabase for providing the backend infrastructure
- Vercel for hosting and deployment
- The ISL community for guidance and feedback
- Contributors and beta testers

---

**Note**: This application is currently in active development. Some features like real-time gesture recognition and AR integration are planned for future releases. The current version provides a solid foundation with simulated AI responses and placeholder functionality that will be replaced with actual AI models.#   s h r a v a n - v i s o n  
 