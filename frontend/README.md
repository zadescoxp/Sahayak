# Sahayak Frontend

The frontend of Sahayak is built with Next.js, React, and TypeScript, providing a user-friendly interface for the AI-powered digital assistant designed for senior citizens and children.

## Features

- **Responsive UI**: Optimized for all devices with special emphasis on accessibility
- **Multiple Chat Modes**: Interface for different assistance modes (General, Religious, Health, Schemes)
- **Text-to-Speech**: Audio playback of AI responses for better accessibility
- **User Authentication**: Secure login and profile management
- **Health Module Interface**: Upload and view medical documents with AI analysis

## Tech Stack

- **Next.js** (v15.2.4): React framework for server-rendered applications
- **React** (v19.0.0): UI component library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework for styling
- **Firebase**: Authentication and user management
- **Web APIs**: For audio functionality

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js app router pages
│   │   ├── login/               # Authentication pages
│   │   ├── mode/                # Different assistance modes
│   │   │   ├── [id]/            # Dynamic routes for modes
│   │   │   └── health/          # Health specific mode
│   │   └── page.tsx             # Home page
│   ├── components/              # Reusable UI components
│   │   └── MarkdownRenderer.tsx # Renders markdown content
│   └── firebase/                # Firebase configuration
├── utils/                       # Utility functions
│   └── middleware.tsx           # Authentication middleware
└── public/                      # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone https://github.com/your-username/sahayak.git
   cd sahayak/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_BACKEND=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Key Components

### AuthMiddleware
The `AuthMiddleware` component ensures that only authenticated users can access protected routes. It redirects unauthenticated users to the login page.

### Chat Interface
The chat interface allows users to send messages and receive responses from the AI assistant. It also includes text-to-speech functionality for better accessibility.

### Health Module
The health module includes features for uploading and analyzing medical documents, as well as receiving personalized health advice.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

To run the production build locally:

```bash
npm run start
# or
yarn start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
