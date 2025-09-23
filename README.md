# 🍽️ Grub Distributor Frontend

Modern, responsive frontend for the Grub food distribution management system built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🔐 Authentication & Authorization

- **JWT-based Authentication**: Secure login/logout with token management
- **Role-based Access Control**: Admin, Distributor, and Customer roles
- **Device-based Rate Limiting**: Enhanced security with device ID tracking
- **Protected Routes**: Route guards based on authentication and roles

### 📱 Modern UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Support**: System preference detection and manual toggle
- **Accessible Components**: WCAG compliant UI components
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Real-time feedback system

### 🚀 Performance & Developer Experience

- **Next.js 15 App Router**: Latest Next.js features with server components
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching with caching and synchronization
- **Form Validation**: React Hook Form with Zod schema validation
- **Code Splitting**: Automatic code splitting for optimal performance

### 📊 Business Features

- **Product Management**: CRUD operations for products and categories
- **Order Processing**: Complete order lifecycle management
- **Store Management**: Multi-store support for distributors
- **Analytics Dashboard**: Real-time business insights
- **Inventory Tracking**: Stock management and alerts

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React (when installed)
- **Development**: ESLint + Prettier

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── products/          # Product management
│   ├── orders/            # Order management
│   ├── stores/            # Store management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── api.ts             # API client configuration
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
│   └── api.ts             # API response types
└── hooks/                 # Custom React hooks
    ├── useAuth.ts         # Authentication hook
    ├── useApi.ts          # API hooks
    └── useLocalStorage.ts # Storage hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Grub API server running on `http://localhost:8520`

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd grub-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8520
   NEXT_PUBLIC_APP_NAME=Grub Distributor
   NODE_ENV=development
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable                        | Description                 | Default                 |
| ------------------------------- | --------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`           | Backend API URL             | `http://localhost:8520` |
| `NEXT_PUBLIC_APP_NAME`          | Application name            | `Grub Distributor`      |
| `NEXT_PUBLIC_ENABLE_DEVTOOLS`   | Enable React Query devtools | `true`                  |
| `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` | Default pagination size     | `20`                    |
| `NEXT_PUBLIC_MAX_FILE_SIZE`     | Max file upload size        | `5242880` (5MB)         |

### API Integration

The frontend integrates with the Grub API backend:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT tokens stored in localStorage
- **Device Tracking**: Automatic device ID generation and tracking
- **Rate Limiting**: Respects API rate limits with proper error handling
- **Error Handling**: Comprehensive error handling with user feedback

## 🎨 UI Components

### Base Components

- **Button**: Configurable button with variants and loading states
- **Input**: Form input with validation and error display
- **Card**: Container component for content sections
- **Modal**: Accessible modal dialogs
- **Toast**: Notification system

### Form Components

- **LoginForm**: User authentication form
- **RegisterForm**: User registration form
- **ProductForm**: Product creation/editing form
- **OrderForm**: Order placement form

### Layout Components

- **Header**: Navigation and user menu
- **Sidebar**: Main navigation sidebar
- **Footer**: Application footer
- **AuthGuard**: Route protection component

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: JWT token stored in localStorage
3. **API Requests**: Token included in Authorization header
4. **Device Tracking**: Device ID sent with requests
5. **Auto Refresh**: Token refresh on expiration
6. **Logout**: Token removal and redirect

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Friendly**: Optimized for touch interactions
- **Accessibility**: WCAG 2.1 AA compliance

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t grub-frontend .

# Run container
docker run -p 3000:3000 grub-frontend
```

### Static Export

```bash
# Generate static files
npm run build
npm run export
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 API Integration

The frontend seamlessly integrates with the Grub API backend:

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Business Endpoints

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/stores` - List stores

### Health & Monitoring

- `GET /health` - API health check
- `GET /health/detailed` - Detailed health status

## 🎯 Next Steps

- [ ] Add comprehensive test coverage
- [ ] Implement offline support with service workers
- [ ] Add real-time notifications with WebSockets
- [ ] Implement advanced analytics dashboard
- [ ] Add multi-language support (i18n)
- [ ] Integrate with payment gateways
- [ ] Add mobile app with React Native

---

Built with ❤️ by the Grub Team
