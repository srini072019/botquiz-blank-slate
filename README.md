
# Assessify - Online MCQ Exam Platform

## Project Overview
Assessify is a modern web application built with Vite, React, Tailwind CSS, and ShadCN UI. It serves as an online MCQ (Multiple Choice Questions) exam platform that is fully mobile-ready and designed for educational institutions and organizations.

## Features

The application supports three user roles:

1. **Admin**
   - Manage users (instructors and candidates)
   - Oversee courses, subjects, exams
   - View statistics and reports

2. **Instructors**
   - Create and manage courses and subjects
   - Build question banks
   - Create and configure exams
   - Review exam results

3. **Candidates**
   - Enroll in courses
   - Take exams
   - View results and progress

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Routing**: React Router
- **State Management**: React Query
- **Future Database**: Supabase (planned integration)

## Development Roadmap

### Phase 1: Core Structure & Authentication
- [x] Project setup with Vite, React, TypeScript
- [x] UI foundation with Tailwind CSS and ShadCN
- [x] User interfaces for all three roles
- [ ] Authentication with Supabase

### Phase 2: Course & Subject Management
- [ ] Course CRUD operations
- [ ] Subject CRUD operations
- [ ] Course enrollment system
- [ ] Admin and instructor dashboards

### Phase 3: Question Bank & Exam System
- [ ] Question bank creation and management
- [ ] Exam creation and configuration
- [ ] Exam taking interface
- [ ] Result calculation and display

### Phase 4: Advanced Features
- [ ] Analytics and reporting
- [ ] Notifications system
- [ ] Export functionality
- [ ] Mobile optimizations

## Getting Started

1. **Clone the repository**
   ```
   git clone [repository-url]
   cd assessify
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the development server**
   ```
   npm run dev
   ```

4. **Build for production**
   ```
   npm run build
   ```

## Project Structure

The project follows a component-based architecture with a clear separation of concerns:

- `src/components`: Reusable UI components
- `src/pages`: Individual page components
- `src/layouts`: Layout wrappers for different sections
- `src/hooks`: Custom React hooks
- `src/services`: API service functions
- `src/types`: TypeScript type definitions
- `src/constants`: Application constants
- `src/utils`: Utility functions

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
