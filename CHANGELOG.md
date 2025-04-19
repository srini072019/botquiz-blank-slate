
# Changelog

All notable changes to the Assessify project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Question management interface with create, read, update, delete functionality
- Question list with filtering and search capabilities
- Question form with support for multiple question types
- Support for multiple choice, true/false, and multiple answer questions
- Question difficulty levels
- Supabase database integration for courses, subjects, and questions

### Changed
- Refactored AuthContext for better performance and reliability
- Updated Dashboard components to display user role information
- Improved course management with questions count
- Enhanced UI for better user experience

## [0.4.0] - 2025-04-08

### Added
- Question bank system with multiple question types (MCQ, True/False, Multiple Answer)
- Question difficulty levels and categorization by subject
- Question search and filtering capabilities
- Exam creation and management system
- Exam settings (time limits, passing score, shuffling)
- Exam scheduling with start and end dates
- Exam status workflow (Draft, Published, Archived)
- Subject detail view with questions management
- Integrated question selection for exams

### Changed
- Updated course detail page with tabs for subjects and exams
- Enhanced subject list with direct navigation to question management
- Improved router configuration with question and exam routes
- Refactored code structure for better maintainability

## [0.3.0] - 2025-04-08

### Added
- Course and Subject management functionality
- Course creation, editing, and deletion for instructors
- Subject creation, editing, and deletion for courses
- Course enrollment system for candidates
- Course listing and filtering for candidates and instructors
- Course detail view with subject management
- Dashboard statistics for course management

### Changed
- Updated layouts to support course navigation
- Improved router configuration with course and subject routes
- Enhanced UI components for course and subject display
- Refactored code structure for better maintainability

## [0.2.0] - 2025-04-08

### Added
- Authentication system with login, register, and password recovery
- Role-based access control for Admin, Instructor, and Candidate users
- Protected routes based on user roles
- Auth context for managing user state across the application
- Demo login credentials for testing different user roles

### Changed
- Updated layouts to check for authentication status
- Home page now shows different options for logged-in vs anonymous users
- Router configuration to support authenticated and unauthenticated states

## [0.1.0] - 2025-04-08

### Added
- Initial project structure with Vite, React, TypeScript
- Tailwind CSS integration with custom theme
- ShadCN UI components
- Basic routing with React Router
- Common components (Logo, Navbar, Footer)
- Layout templates for different user roles
- Home page with hero section and features
- Authentication UI (Login, Register, Forgot Password)
- Dashboard UI for all three user roles (Admin, Instructor, Candidate)
- Project documentation in README
