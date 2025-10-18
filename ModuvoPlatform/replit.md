# Moduvo Platform - Luxury Modular Storage Solutions

## Overview

Moduvo is a high-end e-commerce platform specializing in luxury modular storage solutions. The platform provides an immersive customer experience featuring AR/3D product visualization, extensive customization options, and a concierge-style quote system. Built as a full-stack web application, it combines modern React frontend with Express.js backend, targeting customers seeking premium modular furniture with real-time visualization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Progress (Updated: August 14, 2025)

### Platform Independence Achieved (August 11, 2025)
- **Complete Replit Removal**: Successfully eliminated all Replit dependencies for fully autonomous operation
- **JWT Authentication System**: Implemented secure JWT-based authentication replacing Replit Auth
- **Password Security**: Added bcrypt password hashing with configurable rounds and salt
- **Role-Based Access Control**: Admin/customer roles with protected route middleware
- **Self-Contained Auth**: User registration, login, logout, and password reset endpoints
- **Environment Configuration**: Comprehensive production environment template with all required variables
- **Cookie-Based Sessions**: HTTP-only secure cookies for browser authentication with localStorage fallback

### Production Infrastructure Complete
- **Nginx Configuration**: Production-ready reverse proxy with rate limiting and security headers
- **Systemd Service**: Complete service definition with resource limits and auto-restart
- **Health Monitoring**: /healthz endpoint for uptime monitoring and load balancer health checks
- **Log Management**: Structured logging with rotation policies for application and web server logs
- **SSL/Security**: Complete HTTPS setup with Let's Encrypt auto-renewal and security headers
- **Admin Setup**: Automated admin user creation from environment variables
- **Database Migrations**: Drizzle-based schema management with production migration scripts

### Email & Domain Integration
- **Migadu Integration**: Complete SMTP configuration with production-ready email templates
- **Domain Configuration**: Full DNS setup guide for moduvo.to with MX, SPF, DKIM, and DMARC records
- **Quote Emails**: Automated HTML email generation for customer quotes with professional branding
- **Email Validation**: SMTP connection testing and error handling for reliable delivery

### Deployment Readiness
- **Contabo VPS**: Complete server provisioning guide with Ubuntu 22.04 LTS setup
- **Google Cloud Storage**: Object storage configuration for 3D models and user uploads
- **Security Hardening**: Firewall configuration, user permissions, and service isolation
- **Monitoring Stack**: Health checks, log aggregation, and performance monitoring setup
- **Backup Strategy**: Automated database backups with retention policies

### Product Data Population (August 14, 2025)
- **Database Seeding**: Added automatic database population with modular storage product categories
- **Product Categories**: Cabinets, Storage Wall Unit, Shelves, Office Storage, Garage Storage
- **Component System**: 6 customizable components including shelves, drawers, lighting, and hardware
- **Finish Options**: 5 finish choices with price multipliers ranging from base price to +25%
- **Development Auto-Seeding**: Database automatically populates on development startup

## System Architecture

### Frontend Architecture
**Technology Stack**: React 18 with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Routing**: Client-side routing with Wouter for lightweight navigation
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn components for consistent, accessible design
- **Styling**: Tailwind CSS with custom Moduvo brand colors (gold accent, charcoal, ivory)
- **Build System**: Vite for fast development and optimized production builds

### 3D/AR Visualization System
**WebXR Integration**: Browser-based AR experiences using WebXR API with Three.js for 3D rendering
- **3D Asset Pipeline**: glTF/GLTFLoader for efficient 3D model loading and rendering
- **AR Features**: Real-time product placement in user environments via mobile device cameras
- **Fallback Strategy**: Graceful degradation to standard 3D viewer when AR is unsupported
- **Asset Storage**: External CDN storage for 3D models to optimize performance

### Backend Architecture
**Node.js/Express**: RESTful API server with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **Email System**: Nodemailer for automated quote delivery
- **File Upload**: Google Cloud Storage integration for asset management

### Database Design
**PostgreSQL Schema**: Modular product catalog with flexible component system
- **Products Table**: Base product definitions with pricing and 3D model references
- **Components Table**: Modular add-ons and customization options
- **Finishes Table**: Surface treatments with price multipliers
- **Designs Table**: User-saved configurations
- **Quotes Table**: Customer quote requests with configuration snapshots
- **Users Table**: Customer accounts with Replit Auth integration

### Quote Calculation Engine
**Dynamic Pricing**: Sophisticated pricing algorithm considering materials, labor, delivery, and location
- **Component-based Pricing**: Additive pricing for modular components
- **Finish Multipliers**: Surface treatment cost adjustments
- **Labor Calculation**: Time-based installation cost estimation
- **Geographic Pricing**: Location-based delivery and labor rate adjustments
- **Margin Application**: Consistent 38% profit margin across all quotes

### User Experience Flow
**Conversion-Optimized Journey**: Visualization-first approach to maximize engagement before email capture
1. Product Configuration → 2. 3D/AR Visualization → 3. Quote Request Form → 4. Email Delivery
- **Delayed Email Capture**: Users experience full product visualization before providing contact information
- **Concierge Positioning**: Premium, personalized service messaging throughout

## External Dependencies

### Cloud Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: 3D model and asset hosting with CDN distribution
- **Email Service**: SMTP integration for automated quote delivery

### Authentication & Session Management
- **Replit Auth**: OAuth-based authentication system
- **connect-pg-simple**: PostgreSQL session storage

### 3D/AR Technologies
- **Three.js**: WebGL-based 3D rendering and scene management
- **WebXR API**: Browser-native AR capabilities for mobile devices
- **glTF Format**: Industry-standard 3D asset format for efficient loading

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Pre-styled component library built on Radix
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form validation and submission handling
- **Zod**: Runtime type validation for forms and API

### Development Tools
- **TypeScript**: Type safety across full stack
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database migrations and schema management
- **TanStack Query**: Server state management and caching