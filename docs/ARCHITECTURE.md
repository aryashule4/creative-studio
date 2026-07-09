# Architecture Documentation

## System Overview

Creative Studio is a full-stack web application built with modern technologies for real-time collaborative design.

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
│                  (React + Next.js)                           │
└────────────┬──────────────────────────────────────────────────┘
             │
             │ HTTP + WebSocket
             │
┌────────────▼──────────────────────────────────────────────────┐
│              API Gateway (Nginx)                              │
│          (Reverse Proxy & Load Balancer)                      │
└────────────┬──────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌───▼────────────┐
│  Frontend  │  │  Backend API   │
│  Next.js   │  │  Express.js    │
│  (Port 3000)  │  (Port 5000)   │
└────────────┘  └───┬────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼──┐  ┌────▼───┐  ┌───▼────┐
   │   DB  │  │  Cache │  │  S3    │
   │  Postgres  │ Redis  │  │Storage │
   └───────┘  └────────┘  └────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query + Axios
- **Real-time**: Socket.io Client
- **Canvas**: Fabric.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Payments**: Stripe

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **Cloud Storage**: AWS S3

## Data Flow

### Authentication Flow
```
1. User → Registration/Login Form
2. Form → API (/auth/register or /auth/login)
3. API → Database (verify/create user)
4. API → Generate JWT Token
5. Token → Client (localStorage)
6. Client → Attach Token to Headers (Authorization: Bearer <token>)
```

### Project Creation Flow
```
1. User → Dashboard (Create Project Button)
2. Form Data → API (POST /projects)
3. API → Validate Input
4. API → Database (create project)
5. Database → Response with Project ID
6. API → Return Project Data
7. Frontend → Update Local State
8. Frontend → Redirect to Editor
```

### Real-time Collaboration Flow
```
1. User A → Joins Project Room (Socket.io)
2. Socket Server → Register User in Project Room
3. User A → Makes Changes on Canvas
4. Socket Client → Emit 'update-canvas' Event
5. Socket Server → Broadcast to Room
6. User B → Receive Update Event
7. User B → Canvas Updated with Changes
```

## File Structure

```
creative-studio/
├── frontend/                  # Next.js Frontend App
│   ├── src/
│   │   ├── app/              # Next.js 14 App Router
│   │   │   ├── page.tsx      # Landing Page
│   │   │   ├── layout.tsx    # Root Layout
│   │   │   ├── (auth)/       # Auth Pages
│   │   │   ├── dashboard/    # Dashboard Page
│   │   │   └── editor/       # Editor Page
│   │   ├── components/       # React Components
│   │   ├── lib/              # Utilities & Store
│   │   │   ├── api.ts        # API Client
│   │   │   └── store.ts      # Zustand Stores
│   │   └── globals.css       # Global Styles
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Express.js Backend
│   ├── src/
│   │   ├── server.ts         # Main Server File
│   │   ├── routes/           # Route Handlers
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── users.ts
│   │   │   └── files.ts
│   │   ├── middleware/       # Express Middleware
│   │   ├── models/           # Data Models
│   │   ├── services/         # Business Logic
│   │   └── config/           # Configuration
│   ├── migrations/           # Database Migrations
│   ├── seeders/              # Database Seeds
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                      # Documentation
│   ├── API.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── nginx/                     # Nginx Configuration
│   └── nginx.conf
│
├── docker-compose.yml        # Development Environment
├── docker-compose.prod.yml   # Production Environment
└── package.json              # Root Package
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subscription VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Files Table
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "data": { /* response data */ },
  "error": "error message (if any)",
  "pagination": { /* pagination info if applicable */ }
}
```

## Error Handling

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

## Security Considerations

1. **JWT Tokens**: Secure token-based authentication
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configured for frontend domain
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Joi schema validation
6. **Password Hashing**: Bcrypt for secure passwords
7. **Environment Variables**: Sensitive data in .env

## Performance Optimization

1. **Caching**: Redis for session and data caching
2. **Compression**: Gzip compression for responses
3. **CDN**: Static files via CDN
4. **Database Indexing**: Indexes on frequently queried columns
5. **Query Optimization**: Efficient SQL queries
6. **Code Splitting**: React code splitting with Next.js

## Deployment Pipeline

1. **Development**: Local development environment
2. **Testing**: Automated tests in CI/CD
3. **Staging**: Staging environment for QA
4. **Production**: Docker containers on production servers

## Monitoring & Logging

- Application logs to console
- Error tracking and monitoring
- Performance metrics
- User analytics

## Future Enhancements

- [ ] Websocket optimization
- [ ] Advanced collaboration features
- [ ] Mobile app (React Native)
- [ ] Plugin system
- [ ] Advanced export options
- [ ] AI-powered design suggestions
- [ ] Real-time multiplayer cursors
- [ ] Version control/history
