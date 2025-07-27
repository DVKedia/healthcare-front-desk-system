# Healthcare Front Desk Management System

## Overview

This is a full-stack healthcare front desk management application built with React, Express, and PostgreSQL. The system manages patient queues, appointments, and doctor availability for healthcare facilities. It features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 27, 2025**: Successfully integrated PostgreSQL database with Drizzle ORM
- Replaced in-memory storage with persistent database storage
- Added database relations for proper data relationships
- All patient data, appointments, queue items, and doctor information now persist
- Application confirmed working with full functionality

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API endpoints for CRUD operations
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Logging**: Request/response logging middleware for API endpoints

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with TypeScript support
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Neon Database serverless PostgreSQL driver

## Key Components

### Data Models
1. **Users**: Front desk staff with role-based access
2. **Doctors**: Healthcare providers with availability status
3. **Patients**: Patient information and contact details
4. **Queue Items**: Walk-in patient queue management with priority handling
5. **Appointments**: Scheduled appointments with doctor-patient relationships

### Core Features
1. **Queue Management**: 
   - Add walk-in patients to queue
   - Track queue position and status (waiting, with-doctor, completed)
   - Priority handling for urgent cases
   
2. **Appointment Management**:
   - Schedule appointments with available doctors
   - View daily appointment schedules
   - Cancel and reschedule appointments
   
3. **Doctor Management**:
   - Track doctor availability
   - View doctor specializations and contact information
   
4. **Dashboard Analytics**:
   - Real-time statistics (queue length, daily appointments, available doctors, urgent cases)
   - Status indicators and metrics

### UI Components
- **Modal System**: Dialog-based forms for adding patients and booking appointments
- **Data Tables**: Sortable and filterable tables for appointments and queue items
- **Status Badges**: Visual indicators for appointment and queue status
- **Responsive Design**: Mobile-friendly interface with proper breakpoints

## Data Flow

1. **Client Requests**: React components use TanStack Query hooks to fetch data
2. **API Layer**: Express routes handle HTTP requests and validate input with Zod schemas
3. **Storage Layer**: Abstract storage interface allows for flexible data persistence
4. **Database Operations**: Drizzle ORM handles SQL generation and type safety
5. **Real-time Updates**: Query invalidation keeps UI synchronized with backend changes

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework

### Backend Dependencies
- **drizzle-orm**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **zod**: Runtime type validation
- **express**: Web application framework
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Server**: Development server runs with `tsx` for hot reloading
- **Client**: Vite development server with HMR
- **Database**: Connected to external PostgreSQL instance via DATABASE_URL

### Production Build
1. **Client Build**: Vite bundles React application to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema is up-to-date
4. **Static Assets**: Client build serves as static files from Express

### Configuration
- **Environment Variables**: DATABASE_URL required for database connection
- **TypeScript**: Strict type checking with path mapping for imports
- **Build Artifacts**: Separate client and server build outputs
- **Module System**: ES modules throughout the application

The application follows a traditional three-tier architecture with clear separation between presentation (React), business logic (Express API), and data persistence (PostgreSQL). The use of TypeScript throughout ensures type safety across all layers, while the storage abstraction allows for future database changes if needed.