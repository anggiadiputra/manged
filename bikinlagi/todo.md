# TODO - Dashboard Pengelolaan Aset Digital

## 📋 Project Setup & Infrastructure

### Initial Setup
- [ ] Initialize React project with TypeScript
- [ ] Setup Tailwind CSS 3
- [ ] Install and configure shadcn/ui
- [ ] Setup ESLint and Prettier
- [ ] Create project folder structure
- [ ] Setup environment variables (.env.local)
- [ ] Initialize Git repository

### Supabase Setup
- [ ] Create Supabase project
- [ ] Configure Supabase client for React
- [ ] Setup Supabase environment variables
- [ ] Configure Supabase Auth settings
- [ ] Setup Row Level Security (RLS) policies

## 🗄️ Database Design & Implementation

### Database Schema
- [ ] Design ERD for all entities (domains, hosting, vps, websites, staff)
- [ ] Create `domains` table with required fields
- [ ] Create `hosting` table with required fields
- [ ] Create `vps` table with required fields
- [ ] Create `websites` table with required fields
- [ ] Create `staff` table with roles
- [ ] Create `activity_logs` table for tracking activities
- [ ] Setup foreign key relationships between tables
- [ ] Create indexes for performance optimization

### Database Functions & Triggers
- [ ] Create function to auto-update timestamps
- [ ] Create trigger for activity logging
- [ ] Create function to check expiring assets (30 days)
- [ ] Create views for dashboard statistics

## 🔐 Authentication & Authorization

### Authentication Setup
- [ ] Implement login page with email/password
- [ ] Setup Supabase Auth configuration
- [ ] Create protected route wrapper
- [ ] Implement logout functionality
- [ ] Add session management
- [ ] Create password reset flow

### Role-Based Access Control (RBAC)
- [ ] Define role types (super_admin, admin_web, finance)
- [ ] Create role checking utilities
- [ ] Implement role-based route protection
- [ ] Create permission checking hooks
- [ ] Setup RLS policies for each role
- [ ] Test role permissions for each module

## 🏠 Dashboard & Navigation

### Main Dashboard
- [ ] Create dashboard layout component
- [ ] Implement responsive navigation menu
- [ ] Create dashboard statistics cards
  - [ ] Total domains counter
  - [ ] Total hosting counter
  - [ ] Total VPS counter
  - [ ] Total websites counter
- [ ] Create expiring assets widget (30 days)
- [ ] Implement recent activities feed
- [ ] Add quick action buttons

### Navigation & Routing
- [ ] Setup React Router
- [ ] Create navigation structure
- [ ] Implement breadcrumb navigation
- [ ] Add mobile-responsive menu
- [ ] Create 404 page
- [ ] Setup route guards based on roles

## 🌐 Domain Management Module

### Domain CRUD Operations
- [x] **Add Domain: Minimal user input (domain, renewal cost, note). All technical details (registrar, expiry, nameservers, etc.) are fetched automatically from WHOIS and saved.**
- [x] **Accurate WHOIS info: Always up-to-date and consistent with registry.**
- [x] **Easy reporting: Can filter/search by registrar, expiry, nameservers, etc.**
- [ ] Create domain list page with DataTable
- [ ] Implement domain search functionality
- [ ] Add domain filters (expiring, status, etc.)
- [ ] Create domain detail/view page
- [ ] Implement edit domain functionality
- [ ] Add delete domain with confirmation
- [ ] Create domain import/export feature

### Domain-specific Features
- [ ] Parse and display Whois data (now automatic)
- [ ] Create domain expiry countdown
- [ ] Add domain renewal history tracking
- [ ] Implement bulk domain operations

## 🏢 Hosting Management Module

### Hosting CRUD Operations
- [ ] Create hosting list page with DataTable
- [ ] Implement hosting search functionality
- [ ] Create "Add Hosting" form
  - [ ] Provider selection
  - [ ] Package details
  - [ ] Associated domains (multi-select)
  - [ ] Renewal date picker
  - [ ] Cost input
- [ ] Create hosting detail/view page
- [ ] Implement edit hosting functionality
- [ ] Add delete hosting with confirmation

### Hosting-specific Features
- [ ] Link hosting to multiple domains
- [ ] Display associated domains in hosting view
- [ ] Create hosting provider statistics
- [ ] Add hosting package comparison

## 🖥️ VPS Management Module

### VPS CRUD Operations
- [ ] Create VPS list page with DataTable
- [ ] Implement VPS search functionality
- [ ] Create "Add VPS" form
  - [ ] Provider selection
  - [ ] IP address input
  - [ ] Location selection
  - [ ] Root credentials (encrypted storage)
  - [ ] Renewal date picker
  - [ ] Cost input
- [ ] Create VPS detail/view page
- [ ] Implement edit VPS functionality
- [ ] Add delete VPS with confirmation

### VPS-specific Features
- [ ] Secure credential storage/display
- [ ] VPS resource monitoring integration (optional)
- [ ] SSH key management
- [ ] VPS provider statistics

## 🌍 Website Management Module

### Website CRUD Operations
- [ ] Create website list page with DataTable
- [ ] Implement website search functionality
- [ ] Create "Add Website" form
  - [ ] Domain selection/input
  - [ ] CMS selection (WordPress, etc.)
  - [ ] IP address input
  - [ ] Hosting/VPS association
  - [ ] Admin credentials (encrypted)
  - [ ] Renewal date picker
  - [ ] Cost input
- [ ] Create website detail/view page
- [ ] Implement edit website functionality
- [ ] Add delete website with confirmation

### Website-specific Features
- [ ] Link websites to hosting/VPS
- [ ] CMS version tracking
- [ ] SSL certificate status
- [ ] Website uptime monitoring (optional)

## 👥 Staff Management Module

### Staff CRUD Operations
- [ ] Create staff list page
- [ ] Create "Add Staff" form
  - [ ] Name, email, role selection
  - [ ] Password generation/setting
- [ ] Implement edit staff functionality
- [ ] Add delete/deactivate staff
- [ ] Create staff profile page

### Staff-specific Features
- [ ] Role assignment interface
- [ ] Activity history per staff
- [ ] Last login tracking
- [ ] Password reset by admin

## 🔔 Notifications System

### WhatsApp Integration (Fonnte API)
- [ ] Setup Fonnte API integration
- [ ] Create notification templates
- [ ] Implement notification scheduler
- [ ] Create notification settings page
- [ ] Add notification logs

### Notification Types
- [ ] Domain expiry notifications (30, 15, 7, 1 days)
- [ ] Hosting expiry notifications
- [ ] VPS expiry notifications
- [ ] Website expiry notifications
- [ ] Critical alerts for expired assets

## 🎨 UI/UX Implementation

### Component Library
- [ ] Setup shadcn/ui components
- [ ] Create custom theme configuration
- [ ] Build reusable form components
- [ ] Create consistent data tables
- [ ] Implement loading states
- [ ] Add error boundaries
- [ ] Create toast notifications

### Responsive Design
- [ ] Test and optimize for mobile devices
- [ ] Create responsive navigation
- [ ] Optimize data tables for mobile
- [ ] Implement touch-friendly interfaces
- [ ] Test on various screen sizes

## 🔍 Search & Filters

### Global Search
- [ ] Implement global search functionality
- [ ] Create search results page
- [ ] Add search suggestions
- [ ] Implement search history

### Advanced Filters
- [ ] Create filter components for each module
- [ ] Add date range filters
- [ ] Implement saved filter presets
- [ ] Create filter combinations

## 📊 Reports & Analytics

### Reporting Features
- [ ] Create expense summary reports
- [ ] Generate renewal calendar
- [ ] Create asset inventory reports
- [ ] Add export functionality (PDF/Excel)

### Analytics Dashboard
- [ ] Cost analysis by asset type
- [ ] Provider distribution charts
- [ ] Renewal timeline visualization
- [ ] Historical data trends

## 🧪 Testing

### Unit Testing
- [ ] Setup testing framework (Jest/React Testing Library)
- [ ] Write tests for utility functions
- [ ] Test API integrations
- [ ] Test role-based permissions

### Integration Testing
- [ ] Test complete user flows
- [ ] Test database operations
- [ ] Test third-party API integrations
- [ ] Test notification system

### E2E Testing
- [ ] Setup Cypress or Playwright
- [ ] Create E2E test scenarios
- [ ] Test critical user paths
- [ ] Test mobile responsiveness

## 🚀 Deployment & DevOps

### Deployment Setup
- [ ] Configure Vercel project
- [ ] Setup environment variables in Vercel
- [ ] Configure custom domain (if needed)
- [ ] Setup CI/CD pipeline

### Performance Optimization
- [ ] Implement code splitting
- [ ] Optimize images and assets
- [ ] Setup caching strategies
- [ ] Monitor Core Web Vitals

### Security
- [ ] Implement HTTPS everywhere
- [ ] Setup security headers
- [ ] Regular security audits
- [ ] Implement rate limiting
- [ ] Setup backup strategies

## 📝 Documentation

### Technical Documentation
- [ ] Create API documentation
- [ ] Write component documentation
- [ ] Document database schema
- [ ] Create deployment guide

### User Documentation
- [ ] Create user manual
- [ ] Write role-specific guides
- [ ] Create video tutorials
- [ ] Build FAQ section

## 🔄 Post-Launch

### Monitoring & Maintenance
- [ ] Setup error tracking (Sentry)
- [ ] Implement analytics (Google Analytics)
- [ ] Create maintenance schedule
- [ ] Plan for regular updates

### Future Enhancements
- [ ] API for external integrations
- [ ] Mobile app development
- [ ] Advanced automation features
- [ ] Multi-language support
- [ ] Backup and restore functionality

---

## Priority Levels

### 🔴 High Priority (MVP)
- Project setup
- Database design
- Authentication & RBAC
- Basic CRUD for all modules
- Core dashboard
- Basic notifications

### 🟡 Medium Priority
- Advanced search & filters
- WhatsApp notifications
- Reports & analytics
- Full responsive design

### 🟢 Low Priority (Post-MVP)
- Advanced analytics
- API development
- Mobile app
- Extensive automation

---

**Note**: This todo list should be reviewed and adjusted based on specific business requirements and timeline constraints. 