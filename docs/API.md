# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Semua request (kecuali auth) memerlukan JWT token di header:

```
Authorization: Bearer <token>
```

## Main Endpoints

### Authentication

#### Register
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

### Projects

#### List Projects
```
GET /projects?page=1&limit=20
Authorization: Bearer <token>
```

#### Create Project
```
POST /projects
Authorization: Bearer <token>

Body:
{
  "title": "My Project",
  "description": "Project description",
  "width": 1920,
  "height": 1080
}
```

#### Get Project
```
GET /projects/:id
Authorization: Bearer <token>
```

#### Update Project
```
PUT /projects/:id
Authorization: Bearer <token>

Body:
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Project
```
DELETE /projects/:id
Authorization: Bearer <token>
```

### Files

#### Upload File
```
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
file: <file>
projectId: uuid (optional)
```

#### Delete File
```
DELETE /files/:id
Authorization: Bearer <token>
```

### Users

#### Get Current User
```
GET /users/me
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>

Body:
{
  "name": "Jane Doe",
  "bio": "Designer & Developer"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

- **Free tier**: 100 requests/hour
- **Pro tier**: 1000 requests/hour
- **Enterprise**: Unlimited

## WebSocket Events

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_token'
  }
});

// Join project
socket.emit('join-project', { projectId: 'uuid' });

// Listen for updates
socket.on('project-updated', (data) => {
  console.log('Project updated:', data);
});

// Send update
socket.emit('update-canvas', {
  projectId: 'uuid',
  objects: [...]
});
```
