# REST API v1 Reference

All REST endpoints reside under `/api/v1` and return standardized JSON responses.

## Response Formats

### Standard Success Object
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### Paginated List
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 40,
    "totalPages": 4
  }
}
```

### Standard Error Object
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed: Title is required"
  }
}
```

## Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/posts` | List published articles | Public |
| `POST` | `/api/v1/posts` | Create new article | Yes (`post:create`) |
| `GET` | `/api/v1/posts/:id` | Get single post | Public |
| `PATCH` | `/api/v1/posts/:id` | Update article | Yes (`post:update`) |
| `DELETE` | `/api/v1/posts/:id` | Delete article | Yes (`post:delete`) |
| `POST` | `/api/v1/posts/:id/publish` | Publish article | Yes (`post:publish`) |
| `POST` | `/api/v1/posts/:id/autosave` | Auto-save draft | Yes |
| `GET` | `/api/v1/categories` | List categories | Public |
| `GET` | `/api/v1/tags` | List tags | Public |
| `GET` | `/api/v1/search` | Search query (`?q=term`) | Public |
| `POST` | `/api/v1/newsletter/subscribe` | Subscribe to newsletter | Public |
| `GET` | `/api/cron/schedule` | Scheduled publish cron worker | Bearer Secret |
| `GET` | `/api/v1/openapi` | OpenAPI v3 Specification | Public |
