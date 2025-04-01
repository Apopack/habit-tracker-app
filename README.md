# Habit Tracker App

A full-stack habit tracking application with visualization features to help users track and maintain their daily routines.

## Features

- **Habit Management**: Create, edit, delete, and archive habits
- **Habit Tracking**: Track completion of daily habits with streaks
- **Visualization**: View habit completion data in calendar and dashboard views
- **Statistics**: Get insights into habit performance over time
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/habit-tracker-app.git
   cd habit-tracker-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/habit_tracker
   ```

4. Start the development server
   ```
   npm run dev
   ```

### Database Setup

The application uses Drizzle ORM with PostgreSQL. On first run, the database tables will be automatically created and seeded with sample data.

## License

MIT
