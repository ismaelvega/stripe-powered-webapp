# API Reference

## Overview

This API provides endpoints for user authentication, profile management, and payment method verification. The application follows a **Stripe-as-SSOT (Single Source of Truth)** architecture where Stripe maintains all payment-related data, and our database stores only essential references and metadata.

**Important**: This API does **not** process actual payments or purchases. It only handles payment method verification and storage for future use.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

All protected endpoints require a valid Supabase session. Authentication is handled through Supabase Auth with session tokens automatically managed by the client.

### Headers

```http
Authorization: Bearer <supabase_session_token>
Content-Type: application/json
```

---

## Endpoints

### 🔐 Authentication

#### Create User Profile

Creates a user profile and associated Stripe customer after successful registration.

**Endpoint**: `POST /api/auth/create-profile`

**Request Body**:
```json
{
  "userId": "uuid",
  "email": "user@example.com", 
  "fullName": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "stripeCustomerId": "cus_xxxxxxxxxx"
}
```

**Error Responses**:
```json
// 400 - Missing required fields
{
  "error": "Missing required fields"
}

// 500 - Profile creation failed
{
  "error": "Failed to create user profile"
}

// 500 - Internal server error
{
  "error": "Internal server error"
}
```

**Implementation Details**:
- Creates Stripe customer with user metadata
- Inserts profile record linking Supabase user ID to Stripe customer ID
- Implements rollback logic: deletes Stripe customer if profile creation fails
- **Stripe as SSOT**: Customer data is authoritative in Stripe

**Example cURL**:
```bash
curl -X POST https://your-domain.com/api/auth/create-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com",
    "fullName": "John Doe"
  }'
```

---

### 💳 Stripe Integration

#### Create Setup Intent

Creates a Stripe Setup Intent for collecting and verifying payment methods without charging.

**Endpoint**: `POST /api/stripe/setup-intent`

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "paymentMethodId": "pm_xxxxxxxxxx" // Optional: for updating existing methods
}
```

**Response**:
```json
{
  "clientSecret": "seti_xxxxxxxxxx_secret_xxxxxxxxxx",
  "setupIntentId": "seti_xxxxxxxxxx"
}
```

**Error Responses**:
```json
// 401 - Unauthorized
{
  "error": "Unauthorized"
}

// 404 - User profile not found
{
  "error": "User profile not found"
}

// 500 - Stripe error
{
  "error": "Failed to create setup intent"
}
```

**Implementation Details**:
- Retrieves user's Stripe customer ID from profile
- Creates Setup Intent attached to customer
- **Stripe as SSOT**: Setup Intent manages payment method collection
- Supports both new payment methods and updating existing ones

**Example cURL**:
```bash
curl -X POST https://your-domain.com/api/stripe/setup-intent \
  -H "Authorization: Bearer <supabase_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

#### Confirm Payment Method

Confirms a payment method after successful Setup Intent completion and attaches it to the user's Stripe customer.

**Endpoint**: `POST /api/stripe/confirm-payment-method`

**Authentication**: Required (Supabase session)

**Request Body**:
```json
{
  "setupIntentId": "seti_xxxxxxxxxx"
}
```

**Response**:
```json
{
  "payment_method": {
    "id": "pm_xxxxxxxxxx",
    "stripe_payment_method_id": "pm_xxxxxxxxxx",
    "card_brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2025,
    "is_default": true
  },
  "message": "Payment method processed successfully"
}
```

**Error Responses**:
```json
// 400 - Missing payment method ID
{
  "error": "Payment method ID is required"
}

// 401 - Unauthorized
{
  "error": "Unauthorized"
}

// 404 - User profile not found
{
  "error": "User profile not found"
}

// 500 - Database or Stripe error
{
  "error": "Failed to save payment method"
}
```

**Implementation Details**:
- Retrieves Setup Intent and associated payment method from Stripe
- Validates Setup Intent was successful and payment method is a card
- Attaches payment method to user's Stripe customer
- Automatically sets as default if it's the user's first payment method
- **Stripe as SSOT**: All payment method data remains in Stripe only
- No local database storage of payment method details

**Example cURL**:
```bash
curl -X POST https://your-domain.com/api/stripe/confirm-payment-method \
  -H "Authorization: Bearer <supabase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "setupIntentId": "seti_1234567890_secret_abcdef"
  }'
```

---

#### Get Payment Method Details

Retrieves detailed payment method information from Stripe (SSOT).

**Endpoint**: `GET /api/stripe/get-payment-method?paymentMethodId=pm_xxxxxxxxxx`

**Authentication**: Required (Supabase session)

**Query Parameters**:
- `paymentMethodId` (required): Stripe payment method ID

**Response**:
```json
{
  "id": "pm_xxxxxxxxxx",
  "type": "card",
  "card": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2025,
    "funding": "credit",
    "country": "US"
  },
  "customer": "cus_xxxxxxxxxx",
  "created": 1641234567
}
```

**Error Responses**:
```json
// 400 - Missing payment method ID
{
  "error": "Payment method ID is required"
}

// 401 - Unauthorized
{
  "error": "Unauthorized"
}

// 404 - Payment method not found or unauthorized
{
  "error": "Payment method not found"
}

// 500 - Stripe error
{
  "error": "Failed to retrieve payment method"
}
```

**Implementation Details**:
- Fetches complete payment method data from Stripe
- Verifies payment method belongs to authenticated user's customer
- **Stripe as SSOT**: Returns authoritative data from Stripe API
- Used for displaying detailed payment method information

**Example cURL**:
```bash
curl -X GET "https://your-domain.com/api/stripe/get-payment-method?paymentMethodId=pm_1234567890" \
  -H "Authorization: Bearer <supabase_token>"
```

---

#### List Payment Methods

Retrieves all payment methods for the authenticated user directly from Stripe.

**Endpoint**: `GET /api/stripe/list-payment-methods?user_id=<uuid>`

**Authentication**: Required (Supabase session)

**Query Parameters**:
- `user_id` (required): Supabase user ID

**Response**:
```json
{
  "payment_methods": [
    {
      "id": "pm_xxxxxxxxxx",
      "stripe_payment_method_id": "pm_xxxxxxxxxx",
      "card_brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025,
      "is_default": true,
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
```json
// 400 - Missing user ID
{
  "error": "User ID is required"
}

// 404 - User profile not found
{
  "error": "User profile or Stripe customer not found"
}

// 500 - Stripe error
{
  "error": "Failed to fetch payment methods"
}
```

**Implementation Details**:
- Fetches user's Stripe customer ID from database
- Retrieves all payment methods directly from Stripe API
- Identifies default payment method from Stripe customer settings
- **Stripe as SSOT**: All data comes from Stripe, no local caching
- Transforms Stripe data format for frontend compatibility

**Example cURL**:
```bash
curl -X GET "https://your-domain.com/api/stripe/list-payment-methods?user_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <supabase_token>"
```

---

## Data Architecture

### Stripe as Single Source of Truth (SSOT)

This application implements a **Stripe-as-SSOT** architecture:

#### What Stripe Stores (Authoritative):
- **Customer Data**: Complete customer profiles
- **Payment Methods**: Full payment method details, security data
- **Setup Intents**: Payment method collection workflows
- **Metadata**: Custom data attached to Stripe objects

#### What Database Stores (References):
- **User-Customer Mapping**: Links Supabase user IDs to Stripe customer IDs


### Data Flow

```
1. User Registration
   ├── Supabase Auth creates user
   ├── API creates Stripe customer
   └── Database stores user_id ↔ stripe_customer_id mapping

2. Payment Method Addition
   ├── Frontend collects card via Stripe Elements
   ├── API creates Setup Intent (Stripe SSOT)
   ├── Stripe securely processes and stores payment method
   └── No local storage - all data remains in Stripe

3. Payment Method Retrieval
   ├── API fetches user's Stripe customer ID from database
   └── All payment method data retrieved directly from Stripe API
```
