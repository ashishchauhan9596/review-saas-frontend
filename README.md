# Review SaaS Frontend

This is a Next.js 15+ application with Clerk authentication integrated.

## Getting Started

1.  **Environment Variables**:
    Copy the `.env.local` file and fill in your Clerk credentials from the [Clerk Dashboard](https://dashboard.clerk.com/).
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
    CLERK_SECRET_KEY=your_secret_key
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

## Features

-   **Clerk Auth**: Pre-configured with Sign In, Sign Up, and User Profile.
-   **Middleware**: Protected routes and session management.
-   **Tailwind CSS**: Modern styling for a premium feel.
-   **Next.js App Router**: Optimized for performance and SEO.
