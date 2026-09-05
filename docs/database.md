# Database Architecture & Schema

ContentFlow uses PostgreSQL with Drizzle ORM.

## Entity Relationships

- **Users (`users`)**: Core identity and credentials with bcrypt hash.
- **Roles (`roles`)**: `ADMIN`, `EDITOR`, `AUTHOR`, `USER`.
- **User Roles (`user_roles`)**: Many-to-many relationship mapping users to roles.
- **Authors (`authors`)**: Public author profiles linked to user accounts.
- **Categories (`categories`)**: Hierarchical topics with unique slugs and SEO metadata.
- **Tags (`tags`)**: Keyword tags linked to posts via `post_tags`.
- **Media (`media`)**: Media assets catalog with URLs, MIME types, file sizes, and dimensions.
- **Posts (`posts`)**: Publications with full editorial workflow statuses (`DRAFT`, `IN_REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`), reading time, and relations.
- **Comments (`comments`)**: Threaded reader discussion with moderation status (`PENDING`, `APPROVED`, `REJECTED`, `SPAM`).
- **Newsletter Subscribers (`newsletter_subscribers`)**: Double opt-in email list with unsubscribe tokens.
- **Post Views (`post_views`)**: Privacy-conscious page view telemetry.
- **Audit Logs (`audit_logs`)**: Security and editorial action log.
- **Site Settings (`site_settings`)**: Global platform configuration.
