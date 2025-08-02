# QR Track - Next.js Application

QR Track is a modern web application built with Next.js that allows users to generate, track, and manage QR codes. The application features user authentication, a dashboard for QR code management, and analytics capabilities.

## Features

- User authentication system
- QR code generation and management
- Dashboard with analytics
- Responsive design with mobile support
- Database integration with Drizzle ORM
- API endpoints for QR code operations

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- TypeScript - Static typing
- Tailwind CSS - Styling
- Drizzle ORM - Database operations
- Authentication - Custom auth implementation

## Project Structure

Key directories:

- `src/app` - Next.js app router structure
- `src/components` - Reusable UI components
- `src/db` - Database schema and connection
- `src/hooks` - Custom React hooks
- `src/lib` - Utility functions and auth logic
- `src/server` - API route handlers

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Database Setup**: This project requires a PostgreSQL database. Ensure you have one set up and configure your environment variables accordingly.
4. Set up environment variables (copy `.env.example` to `.env`)
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


## 👨‍💻 Author

**Created by Jonas**
For more projects and information, visit <mcurl name="jonas-list.vercel.app" url="https://jonas-list.vercel.app"></mcurl>.


## 📊 Stats

- ![GitHub stars](https://img.shields.io/github/stars/list-jonas/qr-track)
- ![GitHub forks](https://img.shields.io/github/forks/list-jonas/qr-track)
- ![GitHub issues](https://img.shields.io/github/issues/list-jonas/qr-track)
- ![GitHub pull requests](https://img.shields.io/github/issues-pr/list-jonas/qr-track)
- ![Profile views](https://komarev.com/ghpvc/?username=list-jonas&repo=qr-track&color=blue)


## 📈 Star History

Check out the star history for this project:
<a href="https://star-history.com/#list-jonas/qr-track&Date">
   <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=list-jonas/qr-track&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=list-jonas/qr-track&type=Date" />
      <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=list-jonas/qr-track&type=Date" />
   </picture>
</a>