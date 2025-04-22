
# LaunchX LMS

LaunchX is a modern Learning Management System built for educational institutions and corporate training.

## Features

- **Course Management**: Create, edit, and manage courses with ease
- **Exam Creation**: Build exams with multiple question types, including multiple choice and multiple answer
- **Question Bank**: Maintain a repository of questions organized by subjects
- **Candidate Enrollment**: Enroll candidates in courses and automatically assign them to exams
- **Exam Taking**: Secure exam environment with time limits and automatic grading
- **Analytics**: Track candidate progress and exam results

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Supabase account (for database and authentication)

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/launchx-lms.git
cd launchx-lms
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server
```
npm run dev
```

## Tech Stack

- React with TypeScript
- Vite for fast builds
- Tailwind CSS with shadcn/ui components
- Supabase for backend (authentication, database, storage)
- Tanstack React Query for data fetching
- React Router for navigation
- React Hook Form for form handling
- Zod for validation

## User Roles

- **Instructors**: Create and manage courses, subjects, questions, and exams
- **Candidates**: Enroll in courses, take exams, and view results
- **Administrators**: Manage users and system settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
