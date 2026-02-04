# RivHeal EMR Frontend

A comprehensive, offline-first Hospital Management System built with React, TypeScript, and Vite.

## 🚀 Features

- **Offline-First Architecture**: Full functionality without internet connection
- **Decentralized Patient System**: Patients exist globally, hospitals attach to them
- **Dynamic RBAC**: Configurable roles and permissions per hospital
- **Multi-Branch Support**: Hospital HQ with multiple branches
- **Multi-Country Ready**: Currency, date format, timezone configurable
- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rivheal-emr-frontend.git

# Navigate to the project directory
cd rivheal-emr-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
rivheal-emr-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/
│   │   ├── ui/            # Reusable UI components (shadcn)
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   └── shared/        # Shared components
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard
│   │   ├── patients/      # Patient management
│   │   ├── appointments/  # Appointment scheduling
│   │   ├── opd/           # OPD/Consultation
│   │   ├── laboratory/    # Laboratory management
│   │   ├── pharmacy/      # Pharmacy management
│   │   ├── billing/       # Billing
│   │   └── settings/      # Hospital settings
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── api.ts         # API client (Axios)
│   │   └── db.ts          # IndexedDB (Dexie)
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── router.tsx         # React Router configuration
├── .env.example           # Environment variables template
├── package.json
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api/v1` |
| `VITE_APP_NAME` | Application name | `RivHeal EMR` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## 🏗️ Architecture

### State Management

- **Zustand**: Client state (UI, auth, offline queue)
- **TanStack Query**: Server state (API data caching)
- **IndexedDB (Dexie)**: Offline data storage

### Authentication Flow

1. User enters email/password
2. API validates and returns user + branches
3. If single branch: Auto-select and redirect to dashboard
4. If multiple branches: Show branch selection modal
5. User can switch branches via header dropdown

### Offline Sync Strategy

1. All writes go to IndexedDB first
2. Sync queue tracks pending changes
3. When online, sync queue processes in order
4. Conflicts resolved via timestamp comparison
5. User prompted for manual conflict resolution if needed

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- NDPR compliance ready
- Secure token storage
- API request interceptors

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-router-dom` | Routing |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state management |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `axios` | HTTP client |
| `dexie` | IndexedDB wrapper |
| `tailwindcss` | CSS framework |
| `lucide-react` | Icons |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by RivHeal Technologies Limited.

## 📞 Support

For support, email support@rivheal.com or join our Slack channel.

---

Built with ❤️ by the RivHeal Team
