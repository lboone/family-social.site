# Family Social Site

A modern social platform built by family for family. Connect, share, and stay in touch with your loved ones in a private, secure environment.

## 🌟 Features

- **Family-Focused Social Network** - Share moments with your family members
- **Secure Authentication** - Email verification and password reset functionality
- **Rich Media Sharing** - Post photos, and updates
- **Hashtag Support** - Organize and discover content with hashtags
- **User Profiles** - Customizable profiles with bio and profile pictures
- **Progressive Web App** - Install on mobile devices for app-like experience
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository

```bash
git clone https://github.com/lboone/family-social.site.git
cd family-social.site/frontend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Font**: Roboto (Google Fonts)
- **Authentication**: Custom auth system with email verification
- **Progressive Web App**: Full PWA support with manifest and service workers

## 📱 Progressive Web App

This app is designed as a Progressive Web App (PWA) with:

- App manifest for installation
- Custom icons for all platforms
- Offline functionality
- Mobile-optimized experience

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Social Media Integration

The app includes comprehensive social media optimization:

- Open Graph tags for Facebook sharing
- Twitter Card support
- Rich link previews
- Custom favicon and app icons

## 📁 Project Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── auth/           # Authentication pages
│   ├── profile/        # User profile pages
│   ├── post/           # Post-related pages
│   └── layout.tsx      # Root layout with metadata
├── components/         # Reusable UI components
├── HOC/               # Higher-order components
├── public/            # Static assets and PWA files
└── utils/             # Utility functions
```

## 🚀 Deployment

The app is configured for deployment on Vercel or any Node.js hosting platform.

1. Build the project:

```bash
npm run build
```

2. Deploy to your hosting platform of choice

## 🤝 Contributing

This is a family project, but contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is private and intended for family use.
