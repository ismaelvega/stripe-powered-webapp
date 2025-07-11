# Stripe-Powered SaaS Webapp

A modern SaaS application built with Next.js, featuring identity verification, payment methods processing, and automated workflows. Perfect for one-time purchase products with secure payment method management.

## 🚀 Features

### Authentication & User Management
- **Supabase Auth Integration**: Secure signup/login with email/password
- **Protected Routes**: Dashboard access control with middleware
- **Automatic Profile Creation**: Stripe customers created on signup
- **User Session Management**: Persistent authentication state

### Payment Processing
- **Stripe Integration**: Secure payment method collection and storage
- **Payment Method Management**: Add, update, and manage payment methods
- **Setup Intents**: PCI-compliant card verification without charges
- **One-Time Purchase Model**: Simplified architecture for direct payments

### User Interface
- **Modern Design**: Built with Tailwind CSS and ShadCN components
- **Responsive Layout**: Mobile-first design approach
- **Dark/Light Theme Support**: Adaptive theme system
- **Interactive Notifications**: SweetAlert2 for user feedback

### Automation & Workflows
- **N8N Integration**: Webhook triggers for automated workflows
- **Post-Login Automation**: Trigger workflows after user authentication
- **Scalable Architecture**: Ready for complex business logic

## 🛠 Tech Stack

### Frontend
- **Next.js 15.3.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **ShadCN**: Pre-built component library
- **React Hooks**: Modern state management

### Backend & Database
- **Supabase**: Backend-as-a-Service (Auth + Postgres)
- **PostgreSQL**: Relational database with Row Level Security
- **Supabase Auth**: User authentication and session management

### Payment Processing
- **Stripe**: Payment processing and method storage
- **Stripe Elements**: Secure payment form components
- **Setup Intents**: Card verification without charges

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Stripe account (test mode supported)
- N8N instance (optional, for workflows)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ismaelvega/stripe-powered-webapp.git
   cd stripe-powered-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env.local` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Stripe Configuration
   STRIPE_PUBLIC_KEY=pk_test_your_public_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key

   # N8N Webhook (Optional)
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Database Setup**
   
   Run the provided SQL schema in your Supabase project:
   ```sql
   -- See markdown/postgress_db_schema.md for complete schema
   ```

5. **Development Server**
   ```bash
   pnpm dev
   ```

## 🏗 Project Structure

```
webapp/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/create-profile/  # User profile creation
│   │   └── stripe/               # Stripe payment endpoints
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Protected dashboard pages
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── layout/                   # Layout components
│   └── payment/                  # Payment management components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
```

## 💳 Payment Method flow

### User Registration
1. User signs up with email/password
2. Supabase creates user account
3. **Automatic Stripe customer creation**
4. User profile created with `stripe_customer_id`
5. User can immediately add payment methods

### Payment Method Management
1. User navigates to payment methods page
2. Stripe Elements form for secure card input
3. Setup Intent created for card verification
4. Payment method saved to user's Stripe customer


## 📱 User Experience

### Dashboard Features
- **Payment Methods**: Secure card management
- **Course Access**: Content delivery (expandable)

### UI/UX Highlights
- Clean, modern interface
- Mobile-responsive design
- Real-time form validation
- Accessible component design
- Smooth animations and transitions

## 🚀 Deployment

### Vercel (Recommended)
```bash
pnpm deploy  # Custom script for Vercel deployment
```

### Manual Deployment
```bash
pnpm build
# Deploy .next folder to your hosting platform
```

### Environment Variables
Configure the same environment variables in your production deployment platform.

## 📋 Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm deploy     # Deploy to Vercel
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/create-profile` - Create user profile and Stripe customer

### Stripe Integration
- `POST /api/stripe/setup-intent` - Create setup intent for card verification
- `POST /api/stripe/confirm-payment-method` - Confirm and save payment method
- `GET /api/stripe/get-payment-method` - Retrieve payment method details