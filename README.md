# EBBB Restaurant Management System

A modern restaurant management system built with Next.js, Tailwind CSS, and Supabase. Features both a customer-facing website and an admin dashboard for managing products, announcements, reservations, and orders.

## Features

### Customer Frontend
- **Homepage**: Displays menu items, announcements, and restaurant information
- **Online Ordering**: Browse menu, add items to cart, place orders for pickup or delivery
- **Reservations**: Book tables with date, time, and party size selection
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Dashboard
- **Dashboard**: Overview of key metrics and recent activity
- **Products Management**: Add, edit, delete, and toggle availability of menu items
- **Announcements**: Create and manage news/announcements for the website
- **Reservations**: View and manage customer reservations with status updates
- **Orders**: Track and update order status from pending to completed

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (for admin access)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### 2. Clone and Install
```bash
cd ebbb-system
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to SQL Editor and run the schema from `database/schema.sql`

### 4. Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database/schema.sql
```

This will create:
- Tables for products, announcements, reservations, and orders
- Sample data to get you started
- Row Level Security policies
- Automatic timestamp triggers

### 6. Run the Application

```bash
npm run dev
```

Visit:
- **Customer Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── announcements/     # Announcements management
│   │   ├── orders/           # Orders management
│   │   ├── products/         # Products management
│   │   ├── reservations/     # Reservations management
│   │   └── layout.tsx        # Admin layout with sidebar
│   ├── order/                # Online ordering page
│   ├── reservations/         # Reservation booking page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── lib/
│   └── supabase.ts           # Supabase client and types
└── database/
    └── schema.sql            # Database schema and sample data
```

## Database Schema

### Products
- Menu items with name, description, price, category, and availability
- Image URLs for product photos
- Categories: Mains, Salads, Drinks, Desserts, Appetizers, Sides

### Announcements
- News and announcements for the website
- Title, content, optional image, and published status
- Displayed on homepage when published

### Reservations
- Customer table bookings
- Contact info, date/time, party size, special requests
- Status tracking: pending, confirmed, cancelled

### Orders
- Online orders for pickup or delivery
- Customer info, items (JSON), total amount, delivery address
- Status tracking: pending → confirmed → preparing → ready → completed

## Customization

### Styling
- Colors can be changed in `tailwind.config.js`
- The orange theme can be replaced with your brand colors
- Layout and components are fully customizable

### Content
- Update restaurant information in the homepage
- Add your own product images and descriptions
- Customize the database schema for additional fields

### Features
- Add payment integration (Stripe, PayPal, etc.)
- Implement email notifications
- Add user authentication for customers
- Integrate with POS systems

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Support

For issues or questions:
1. Check the Supabase documentation
2. Review Next.js documentation
3. Check the GitHub issues

## License

This project is open source and available under the MIT License.