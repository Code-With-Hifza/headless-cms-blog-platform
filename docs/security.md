# Security & RBAC Policy

ContentFlow implements defensive security defaults across every layer of the application.

## 1. Authentication & Session Security
- Passwords are encrypted with bcrypt (10 rounds salt).
- Sessions are secured with signed JWTs and HttpOnly cookies.
- Account deactivation immediately revokes authentication access.

## 2. Server-Side Authorization (RBAC)
- Client-supplied roles and identities are never trusted.
- Every mutation performs server-side identity verification via `getCurrentUser()`.
- Granular permissions prevent unauthorized authors from publishing, modifying, or deleting other writers' articles.

## 3. Defensive Validation & XSS Prevention
- All inputs are strictly validated with Zod schemas.
- Rich-text editor HTML is sanitized through `isomorphic-dompurify` to strip dangerous scripts, malicious event handlers, and iframe vectors.
- Media uploads enforce strict MIME type checks, extension matching, and size limits (10MB max).
