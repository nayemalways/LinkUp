# LinkUp

LinkUp is an event management API for building community-driven event apps. It helps users discover events, create and host events, book paid events, connect with friends, chat in real time, and receive notifications from one backend service.

Detailed endpoint documentation has been moved to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## What Problem Does LinkUp Solve?

People often need separate tools for event discovery, event hosting, ticket payments, social coordination, messaging, and notifications. LinkUp combines those workflows into one backend so an event platform can manage the full journey:

- Users can find events that match their interests and location.
- Hosts can create events, manage attendance, receive payments, and promote events.
- Friends can coordinate through requests, groups, direct messages, and real-time notifications.
- Admins can monitor platform activity, revenue, bookings, and sponsored event performance.

## Features

- Authentication with JWT access and refresh tokens.
- Email verification, OTP flows, password reset, Google OAuth, and local login.
- Role-based access for `USER`, `ORGANIZER`, and `ADMIN`.
- User profile management, avatar upload, interests, phone validation, and soft delete.
- Event creation, event categories, multiple images, co-hosts, event status, favourites, trending events, and recommendations.
- Location-based event discovery with GeoJSON support.
- Friend requests, friend lists, block/unblock flows, and social notifications.
- Direct messages, group chats, replies, message status, and Socket.IO real-time updates.
- Push and in-app notifications with Firebase Cloud Messaging support.
- Booking and Stripe payment intents for paid events.
- Stripe Connect support for host payouts and vendor dashboard access.
- Sponsored and boosted event packages with Stripe webhooks.
- Admin dashboard analytics for users, events, revenue, bookings, sponsored events, and boosts.
- Voting support for event-related decisions.
- File uploads through Multer and Cloudinary.
- Security middleware for rate limiting, sanitized MongoDB queries, validation, sessions, CORS, and safer request handling.
- Cron job support for scheduled cleanup tasks.

## Tech Stack

- Node.js
- Express.js 5
- TypeScript
- MongoDB and Mongoose
- Redis and `connect-redis`
- Socket.IO
- Passport.js
- Stripe
- Firebase Admin
- Twilio
- Cloudinary
- Zod
- ESLint and Prettier

## Project Structure

```text
src/
  app/
    config/        Environment, database-adjacent services, auth, uploads
    cron/          Scheduled jobs
    middlewares/   Auth, validation, error, not-found, sanitizer middleware
    modules/       Feature modules and route/controller/service/model layers
    routes/        API route registration
    socket/        Socket.IO setup and event handlers
    utils/         Shared helpers, seeders, email/payment utilities
  app.ts           Express app, middleware, routes, webhooks
  server.ts        MongoDB/Redis startup and server lifecycle
```

## API Documentation

The complete API reference is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

Base API URL for local development:

```text
http://localhost:5000/api/v1
```

Stripe webhook routes are mounted outside the API prefix:

```text
POST /webhook
POST /webhook_sponsored
```

## Prerequisites

Install or prepare these before running the project:

- Node.js
- npm
- MongoDB database URI
- Redis server
- Cloudinary account for image upload
- SMTP credentials for email
- JWT and session secrets
- Stripe account and webhook secrets for bookings, sponsored events, and payouts
- Firebase service account values for push notifications
- Twilio credentials if SMS/phone messaging flows are used
- Google OAuth credentials if Google login is used

## Project Setup Guidance

1. Clone the project and install dependencies.

```bash
npm install
```

2. Create the environment file.

```bash
cp .env.example .env
```

3. Fill in all required values in `.env`.

The app validates required environment variables on startup. Empty values will stop the server. Start with these core values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/linkup
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
OTP_JWT_ACCESS_SECRET=your_otp_secret
EXPRESS_SESSION_SECRET=your_session_secret
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
```

Then complete provider credentials for Cloudinary, SMTP email, Google OAuth, Firebase, Stripe, and Twilio according to the features you plan to run.

4. Start MongoDB and Redis.

For local development, make sure MongoDB is reachable through `MONGO_URI` and Redis is reachable through `REDIS_HOST` and `REDIS_PORT`.

5. Run the development server.

```bash
npm run dev
```

The server starts at:

```text
http://localhost:5000
```

The API is available at:

```text
http://localhost:5000/api/v1
```

6. Run optional background jobs in a separate terminal.

```bash
npm run cron:dev
```

## Available Scripts

```bash
npm run dev       # Start the TypeScript development server with nodemon
npm run cron:dev  # Start cron jobs in development
npm run build     # Compile TypeScript
npm run lint      # Run ESLint
npm run format    # Format the codebase with Prettier
npm start         # Start the app with PM2 ecosystem config
npm run restart   # Restart the PM2 process
```

## Environment Variables

Use [.env.example](./.env.example) as the source of truth for required variables. The main groups are:

- Server and database
- JWT authentication and OTP secrets
- Frontend URL and session secret
- Redis
- Admin seed account
- SMTP email
- Twilio
- Cloudinary
- Google OAuth and Google Maps
- Firebase service account
- Stripe payment and webhook secrets
- Rate limiting

## Development Notes

- API routes are registered under `/api/v1`.
- The root route redirects to `https://linkupapp.ca`.
- Stripe webhooks require raw request bodies, so they are mounted before `express.json()`.
- The server connects to Redis, MongoDB, and then seeds the admin user during startup.
- Socket.IO is initialized from the HTTP server wrapper in `src/app.ts`.

