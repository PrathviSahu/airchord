# API Documentation

## Base URL
`https://api.airchord.app/v1`

## Authentication Headers

| Header | Value |
|--------|-------|
| Authorization | `Bearer {access_token}` |
| Content-Type | `application/json` |

> **Token Management**: Tokens expire in 15 minutes. Refresh tokens available (7 days). Requires client-side token refresh flow.

### General Rules
- All responses are JSON
- Errors follow standard format: `{ error: "string", code: "code_string" }`
- Success responses: `{ data: {...} }`
- Pagination uses `pagination` object: `{ page, pageSize, totalPages, totalItems }`

### Base Response Codes

| Code | Meaning | Typical Response Body |
|------|---------|------------------------|
| 200 | OK | `{ data: { ... } }` |
| 201 | Created | `{ data: { createdId: "..." } }` |
| 400 | Bad Request | `{ error: "Validation failed", details: [...] }` |
| 401 | Unauthorized | `{ error: "Authentication required" }` |
| 403 | Forbidden | `{ error: "Insufficient permissions" }` |
| 404 | Not Found | `{ error: "Resource not found" }` |
| 429 | Too Many Requests | `{ error: "Rate limit exceeded" }` |
| 500 | Internal Server Error | `{ error: "Something went wrong" }` |

---

## Endpoints

### 1. Authentication (`/auth/*`)

| Endpoint | Method | Auth | Body | Response |
|----------|--------|------|------|----------|
| `/register` | POST | No | `{ email, password, name }` | `201 { user: UserSummary, tokens }` |
| `/login` | POST | No | `{ email, password }` | `200 { tokens }` |
| `/google/callback` | GET | No | `code` query param | `200 { tokens }` |
| `/apple/callback` | GET | No | `code` query param | `200 { tokens }` |
| `/refresh` | POST | Yes | `{ refreshToken }` | `200 { tokens }` |
| `/logout` | POST | Yes | `{ token }` | `204` |

> **Tokens Payload**: `{ accessToken, refreshToken, expiresIn }`

---

### 2. Songs (`/songs/*`)

| Endpoint | Method | Auth | Query Params | Body | Response |
|----------|--------|------|--------------|------|----------|
| `/songs` | GET | No | `page`, `limit`, `search`, `genre[]`, `key`, `minDifficulty`, `maxDifficulty`, `tags[]` | — | `200 { pagination: {...}, data: [SongSummary] }` |
| `/songs` | POST | Yes | — | `SongCreateDTO` | `201 { id, url: /api/v1/songs/{id} }` |
| `/songs/:id` | GET | No | — | — | `200 { data: SongDetail }` |
| `/songs/:id` | PATCH | Owner | `SongUpdateDTO` | `200 { updated }` |
| `/songs/:id` | DELETE | Owner | — | — | `204` |
| `/songs/:id/chords` | GET | No | — | — | `200 { chords: [{measure, chord}, ...] }` |
| `/songs/search` | GET | No | `q=substring` | — | `200 { data: [SongSummary] }` |
| `/songs/recommendations` | GET | Yes | `userPreferences?` | — | `200 { recommendations: [SongSummary] }` |

#### DTOs

```json
// SongCreateDTO
{
  "title": "My Song",
  "artist": "Artist Name",
  "key": "C",
  "tempo": 120,
  "timeSig": "4/4",
  "difficulty": 3,
  "genre": ["pop", "rock"],
  "lyrics": "Optional lyrics here",
  "chords": [
    {
      "measure": 1,
      "chord": "C",
      "duration": 4,
      "lyricLine": "I woke up this morning..."
    },
    { ... }
  ]
}

// SongUpdateDTO (partial)
{
  "title": "Updated Title",
  "artist": "New Artist",
  "key": "G#",
  "tempo": 140,
  "timeSig": "3/4",
  "difficulty": 4,
  "genre": ["indie", "rock"]
}
```

---

### 3. Recordings (`/recordings/*`)

| Endpoint | Method | Auth | Query Params | Body | Response |
|----------|--------|------|--------------|------|----------|
| `/recordings` | POST | Yes | `sessionId?` | `RecordingCreateDTO` | `201 { recordingId }` |
| `/recordings` | GET | Yes | `status`, `type`, `userId?`, `page`, `limit` | — | `200 { data: [RecordingSummary] }` |
| `/recordings/:id` | GET | Owner | — | — | `200 { data: RecordingDetail }` |
| `/recordings/:id/upload` | POST | Owner | `multipart/form-data` | `None` | `202 Accepted { uploadId }` |
| `/recordings/:id/upload` | PUT | Owner | `status: "completed"` | — | `200 { processingStatus }` |
| `/recordings/:id/process` | POST | Owner | — | — | `200 { startedAt }` |
| `/recordings/:id/download` | GET | Owner | `noredirect=true` | — | `302` to S3 signed URL |

#### Recording Status Flow

1. POST `/recordings` → `processing` → upload chunks → `uploaded` 
2. PUT `/process` → system processes to final format → `ready` (or `failed`)
3. GET `/download` → serve via signed URL

---

### 4. Practice (`/practice/*`)

| Endpoint | Method | Auth | Body | Response |
|----------|--------|------|------|----------|
| `/practice/start` | POST | Yes | `{ songId, practiceSettings }` | `200 { sessionId, status:"started" }` |
| `/practice/stop` | POST | Yes | `{ sessionId }` | `200 { score, metrics }` |
| `/practice/progress` | GET | Yes | `sessionId?` | `200 { progressLog }` |
| `/practice/suggestions` | GET | Yes | `sessionId?` | `200 { suggestions }` |

---

### 5. Gestures (`/gestures/*`)

| Endpoint | Method | Auth | Body | Response |
|----------|--------|------|------|----------|
| `/calibrate` | POST | Yes | `{ gestureName, landmarks[] }` | `200 { confidence, saved }` |
| `/custom-mapping` | GET | Yes | — | `200 { mappings[] }` |
| `/custom-mapping/:gesture` | PUT | Yes | `{ chordLabel }` | `200 { success }` |

---

### 6. Students (`/accounts/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-----------|
| `/profile` | GET | Yes | Get current user profile |
| `/profile` | PATCH | Yes | Update profile fields |
| `/preferences` | GET | Yes | Get preferences |
| `/settings` | GET | Yes | Get current settings |
| `/notifications` | GET | Yes | Unread notifications count |
| `/help` | GET | No | Help topics (static) |

---

## WebSocket API (Future)

| Channel | Event Type | Payload | Description |
|---------|------------|---------|-------------|
| `song:collaborate` | `join` | `{ sessionId, userId }` | Join live performance room |
| `song:collaborate` | `play-note` | `{ note, time }` | Play a note on virtual piano |
| `recording:progress` | `update` | `{ recordingId, progress }` | Show recording processing |
| `analytics:update` | `update` | `{ sessionId, newMetrics }` | Share progress updates |

---

## Error Response Format

```json
{
  "error": "Painter is already taken",
  "code": "DUPLICATE_NAME",
  "details": [
    "An artist with that name exists",
    "Please choose a different name"
  ]
}
```

### Common Error Codes

| Code | Meaning | Example |
|------|---------|----------|
| `DUPLICATE_NAME` | Name already exists | Song title, channel name |
| `INVALID_FORMAT` | File format not supported | Uploading `.exe` file |
| `NOT_FOUND` | Resource missing | `/songs/123` doesn't exist |
| `AUTH_REQUIRED` | Missing or invalid token | Accessing `/songs/:id` without auth |
| `PERMISSION_DENIED` | Owner-restricted operation | Editing another user's recording |
| `RATE_LIMITED` | Too many requests | 100 requests/min limit exceeded |
| `CAPTCHA_REQUIRED` | Suspicious activity detected | Multiple failed logins |
| `EXPERIMENTAL_FEATURE` | Beta-only API | `/experimental/ai-coach` |

---

## Versioning Strategy

| Version | Indication | Usage |
|---------|------------|-------|
| v1 | GA (Stable) | All public endpoints |
| v2 | Alpha (Opt-In) | New analytics, premium features |
| v3+ | Preview | Highly experimental features |

All API docs are versioned in URL path (`/v1/`), never in headers or media types.

---

## Backward Compatibility

- **Deprecation Policy**: 6-month timeline from deprecation notice
- **Notice**: Published in `/deprecations` endpoint with countdown
- **Migration Guides**: Provided in API documentation updates
- **Old Version Support**: Maintained for 2 years after deprecation

---

## API Testing

### Local Test Setup

1. **Start Backend**: `npm run dev:api`
2. **Seed DB**: `npm run db:seed`
3. **Import API Routes**: Use `swagger-ui-express` at `/api-docs`
4. **Test Matrix**:
   - Unit: 80%+ coverage
   - Integration: All endpoints with test DB
   - E2E: Cypress simulating client flows
   - Canary: 5% real traffic before full deploy

### CI Tests (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: airchord_test
        ports: ["5432:5432"]
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run db:setup
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

---

## API Governance

### Change Review Process

1. **Proposal** via GitHub Issue (labeled `api-change`)
2. **Reviewer Approval** by 3+ core maintainers
3. **Impact Analysis** (User flows, DB migrations, client breakage)
4. **Beta Release** → Monitor usage + error rates
5. **Go-Live** → Update OpenAPI spec + docs

### API Audit Frequency

- Quarterly security audit
- Rate limit policy review
- Endpoint redundancy check
- Deprecation timeline verification

---

## API Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| API Error Rate | Sentry | >2% of total requests |
| 5xx Errors | CloudWatch | >5 in 5 minutes |
| Latency P95 | Datadog | >500ms sustained |
| Rate Limit Hits | CloudWatch | >90% of quota used |
| Auth Token Expire Failures | Custom Metrics | >10 failures/min |

---

## Documentation & Navigation

- **OpenAPI 3.0 Specification**: `/api/docs/openapi.yaml`
- **Swagger UI**: Accessible at `/api/docusaurus/docs` (hosted via Docusaurus)
- **Changelog**: `/api/CHANGELOG.md`
- **Architecture Overview**: `/api/ARCHITECTURE.md`

---

## Analytics & Search API

| Endpoint | Method | Auth | Query | Response |
|----------|--------|------|-------|----------|
| `/analytics/practices` | GET | User | `timeRange={last7d|all}`, `groupBy=user|song` | `200 { stats }` |
| `/analytics/songs` | GET | User | `popularityScore` filter | `200 { songs }` |
| `/analytics/success` | GET | User | `filter={accuracyTarget}` | `200 { sessions }` |
| `/analytics/cross-genres` | GET | No | `genreA|genreB` | `200 { transitionNetwork }` |

Analytics data is aggregated nightly via cron job and exposed via these lightweight endpoints.

---

## API Governance

See `API/GOVERNANCE.md` for full policies.