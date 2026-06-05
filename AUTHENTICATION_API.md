# Backend API Authentication Integration

## Overview

This application now uses JWT-based authentication with a backend API instead of Firebase. All authentication operations store and manage JWT tokens in localStorage and automatically attach them to HTTP requests via an interceptor.

## API Endpoints

### Base URL
```
http://localhost:3000/api
```
Configure in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // ...
};
```

### Authentication Endpoints

#### 1. POST /api/auth/register
**Register a new user account**

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

Response (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 3600
}
```

#### 2. POST /api/auth/login
**Authenticate existing user**

Request:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 3600
}
```

Error Response (401):
```json
{
  "message": "Invalid email or password"
}
```

#### 3. GET /api/auth/me
**Get current authenticated user profile**

Headers:
```
Authorization: Bearer <jwt_token>
```

Response (200):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-03-20T10:30:00Z"
}
```

Error Response (401):
```json
{
  "message": "Unauthorized"
}
```

## JWT Token Management

### Token Storage
The JWT token is stored in localStorage with the key `jwt_token`:
```typescript
localStorage.setItem('jwt_token', token);
```

### Token Retrieval
```typescript
const token = localStorage.getItem('jwt_token');
```

### Token Removal (Logout)
```typescript
localStorage.removeItem('jwt_token');
localStorage.removeItem('userData');
```

### Auto-Expiration
The token expiration is managed automatically:
- Token expiration time is stored when user logs in
- Auto-logout timer is set based on `expiresIn` value
- User is automatically logged out when token expires

## HTTP Interceptor

### Authorization Header
The `AuthInterceptorService` automatically attaches the JWT token to all outgoing HTTP requests:

```typescript
Authorization: Bearer <jwt_token>
```

### Excluded Endpoints
The interceptor skips adding the Authorization header for:
- `/api/auth/login` - Login endpoint (no auth needed)
- `/api/auth/register` - Registration endpoint (no auth needed)

### Implementation
Located in: `src/app/auth/auth-interceptor.service.ts`

```typescript
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth endpoints
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next.handle(req);
    }

    const token = this.authService.getToken();
    if (!token) {
      return next.handle(req);
    }

    // Clone and add Authorization header
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(modifiedReq);
  }
}
```

## Authentication Flow

### 1. User Registration
```
User submits form → Store dispatches signupStart action → 
AuthEffects calls authService.register() → 
API returns JWT token → Token stored in localStorage → 
User logged in → Redirect to home
```

### 2. User Login
```
User submits form → Store dispatches loginStart action → 
AuthEffects calls authService.login() → 
API returns JWT token → Token stored in localStorage → 
User logged in → Redirect to home
```

### 3. Auto-Login (Page Refresh)
```
App initializes → Check localStorage for userData → 
If valid token exists → Restore user session → 
Set auto-logout timer
```

### 4. Authenticated API Calls
```
Component makes HTTP request → 
AuthInterceptor attaches Authorization header → 
Request sent to API with JWT token
```

### 5. Logout
```
User clicks logout → Store dispatches logout action → 
Clear auth timer → Remove tokens from localStorage → 
Redirect to login page
```

## Key Files Updated

### 1. Auth Service (`src/app/auth/auth.service.ts`)
- `login()` - POST to /api/auth/login
- `register()` - POST to /api/auth/register  
- `getCurrentUser()` - GET /api/auth/me
- `getToken()` - Retrieve JWT from localStorage
- `setToken()` - Store JWT in localStorage
- `removeToken()` - Clear JWT from localStorage
- `isAuthenticated()` - Check if user has valid token

### 2. Auth Effects (`src/app/auth/store/auth.effects.ts`)
- Updated for JWT response structure
- Stores token in localStorage
- Sets auto-logout timer
- Improved error handling for HTTP status codes

### 3. HTTP Interceptor (`src/app/auth/auth-interceptor.service.ts`)
- Attaches `Authorization: Bearer <token>` header
- Skips auth endpoints
- Simplified implementation (no NgRx store dependency)

### 4. User Model (`src/app/auth/user.model.ts`)
- Enhanced with utility methods
- `isValid` - Check token validity
- `timeUntilExpiration` - Get remaining time

### 5. Auth Actions (`src/app/auth/store/auth.actions.ts`)
- Removed Firebase-specific `returnSecureToken` parameter
- Added optional `name` field for registration

### 6. Auth Component (`src/app/auth/auth.component.ts`)
- Updated to use new action signatures
- Removed `returnSecureToken` from dispatches

## Backend API Requirements

Your backend API should:

1. **Accept JSON requests** with appropriate Content-Type headers
2. **Return JWT tokens** in the specified format
3. **Validate JWT tokens** on protected endpoints
4. **Set appropriate expiration times** (recommended: 1-24 hours)
5. **Return consistent error responses** with HTTP status codes:
   - 400: Bad Request (invalid input)
   - 401: Unauthorized (invalid credentials or expired token)
   - 409: Conflict (email already exists)
   - 500: Internal Server Error

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production environments
2. **Token Expiration**: Implement reasonable expiration times (1-24 hours)
3. **Refresh Tokens**: Consider implementing refresh token mechanism for production
4. **XSS Protection**: localStorage is vulnerable to XSS; consider httpOnly cookies for production
5. **CORS**: Configure proper CORS headers on backend
6. **Password Policies**: Enforce strong password requirements on backend

## Testing

### Manual Testing
1. Start your backend API server on `http://localhost:3000`
2. Run the Angular app: `npm start`
3. Navigate to `/auth`
4. Try registration and login flows
5. Verify JWT token in localStorage (DevTools → Application → Local Storage)
6. Check Network tab for Authorization headers on API requests

### Backend API Mock
For development without a backend, you can use a mock server or JSON server:

```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

## Troubleshooting

### Common Issues

**401 Unauthorized on all requests**
- Check that token is stored in localStorage
- Verify Authorization header format: `Bearer <token>`
- Ensure backend is validating tokens correctly

**Token not being attached to requests**
- Verify interceptor is registered in CoreModule
- Check that request URL doesn't match excluded patterns
- Ensure token exists in localStorage

**CORS errors**
- Configure CORS on backend to allow Angular dev server origin
- Add appropriate headers: Access-Control-Allow-Origin, etc.

**Auto-logout not working**
- Verify `expiresIn` value from API is in seconds
- Check that timer is being set correctly
- Look for console errors in browser

## Future Enhancements

1. **Refresh Token Flow**: Implement token refresh before expiration
2. **Remember Me**: Extend token expiration for "remember me" feature
3. **Social OAuth**: Add Google/Facebook/GitHub authentication
4. **Two-Factor Auth**: Implement 2FA for enhanced security
5. **Password Reset**: Add forgot password/reset functionality
6. **Email Verification**: Verify email addresses on registration
