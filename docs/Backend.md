# Backend Documentation

## Folder Structure

```
backend/
├── src/
│   ├── index.ts                # Entry point
│   ├── app.ts                  # Express/Fastify app configuration
│   ├── server.ts               # HTTP server bootstrap
│   │
│   ├── config/
│   │   ├── env.ts              # Environment variables loader (Zod validation)
│   │   ├── database.ts         # Prisma client setup
│   │   ├── redis.ts            # Redis connection pool
│   │   ├── s3.ts               # S3/R2 client configuration
│   │   └── logger.ts           # Winston logger setup
│   │
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── rateLimiter.ts      # Express-rate-limit setup
│   │   ├── cors.ts             # CORS configuration
│   │   ├── validation.ts       # Zod schema validation middleware
│   │   └── compression.ts      # GZIP compression
│   │
│   ├── routes/
│   │   ├── auth.ts             # /api/v1/auth/*
│   │   ├── songs.ts            # /api/v1/songs/*
│   │   ├── recordings.ts       # /api/v1/recordings/*
│   │   ├── practice.ts         # /api/v1/practice/*
│   │   ├── gestures.ts         # /api/v1/gestures/*
│   │   └── user.ts             # /api/v1/user/*
│   │
│   ├── services/
│   │   ├── authService.ts      # Password hashing, token generation
│   │   ├── songService.ts      # Song CRUD, search, recommendation
│   │   ├── recordingService.ts # Processing pipeline, export, S3 upload
│   │   ├── gestureService.ts   # Calibration, custom mapping
│   │   ├── practiceService.ts  # Session tracking, analytics
│   │   └── notificationService.ts # Email/SMS notifications (future)
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── songController.ts
│   │   ├── recordingController.ts
│   │   ├── gestureController.ts
│   │   └── practiceController.ts
│   │
│   ├── validators/
│   │   ├── authValidator.ts    # Zod schemas for auth payloads
│   │   ├── songValidator.ts
│   │   └── recordingValidator.ts
│   │
│   ├── jobs/
│   │   ├── recordingProcessor.ts # FFmpeg worker queue
│   │   └── analyticsAggregator.ts  # Daily/weekly analytics rollups
│   │
│   ├── utils/
│   │   ├── audioUtils.ts       # Audio format conversion
│   │   ├── gestureUtils.ts     # Feature extraction helpers
│   │   └── fileUtils.ts        # S3 upload/download helpers
│   │
│   └── types/
│       ├── auth.ts
│       ├── song.ts
│       └── recording.ts
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Prisma migration files
│   └── seed.ts                 # Seed data (demo songs, chords)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── migrate.ts              # Run Prisma migrations
│   ├── seed.ts               # Seed the database
│   └── generate-types.ts     # Generate TypeScript types from Prisma
│
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Authentication

### Strategy: JWT + Refresh Tokens

```typescript
// authService.ts
class AuthService {
  async register(email: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 12);
    return prisma.user.create({
      data: { email, passwordHash: hashed }
    });
  }
  
  async login(email: string, password: string): Promise<Tokens> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AuthError('Invalid credentials');
    }
    return this.generateTokens(user.id);
  }
  
  generateTokens(userId: string): Tokens {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
  }
}
```

### Middleware Flow

```typescript
// middleware/auth.ts
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Song Engine

### Core Responsibilities
- Song CRUD operations
- Chord progression storage/retrieval
- Search and filtering (genre, key, difficulty, artist)
- Recommendation engine (based on user history)

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/songs` | GET | No | List songs (paginated, filterable) |
| `/songs/:id` | GET | No | Get single song detail |
| `/songs` | POST | Yes | Create new song |
| `/songs/:id` | PATCH | Owner | Update song |
| `/songs/:id` | DELETE | Owner | Delete song |
| `/songs/search` | GET | No | Full-text search |
| `/songs/:id/chords` | GET | No | Get chord data for playback |

### Search Implementation

```typescript
// songService.ts
class SongService {
  async search(query: string, filters: SearchFilters) {
    return prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artist: { contains: query, mode: 'insensitive' } },
          { chords: { hasSome: [query.toUpperCase()] } }
        ],
        ...filters
      },
      take: 50
    });
  }
}
```

---

## Gesture Engine

### Personalization Service

```typescript
// gestureService.ts
class GestureService {
  async calibrate(userId: string, gesture: string, landmarks: Landmark[]) {
    // Store user's hand position data
    await prisma.calibration.create({
      data: {
        userId,
        gesture,
        landmarks: JSON.stringify(landmarks),
        confidence: 0.9
      }
    });
  }
  
  async getMapping(userId: string, gesture: string) {
    const mapping = await prisma.gestureMapping.findFirst({
      where: { userId, gesture }
    });
    return mapping?.chord || DEFAULT_MAPPINGS[gesture];
  }
}
```

### Calibration Data Model

```prisma
model Calibration {
  id        String   @id @default(cuid())
  userId    String
  gesture   String
  landmarks Float[]  // Normalized [x,y,z] for 21 landmarks
  confidence Float
  createdAt DateTime @default(now())
}

model GestureMapping {
  id        String   @id @default(cuid())
  userId    String
  gesture   String
  chord     String
  createdAt DateTime @default(now())
}
```

---

## Recording Engine

### Processing Pipeline

```
Upload Request → Validate File → Store in Staging Bucket
    ↓
Queue: SQS / Redis Stream
    ↓
Worker: FFmpeg.wasm / Native FFmpeg
    - Convert to MP3/WAV/MP4
    - Mix microphone + system audio
    - Apply noise reduction
    - Add reverb/effects
    ↓
Move to Final Bucket (S3/R2)
    ↓
Create DB Record
    ↓
Notify User (WebSocket)
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/recordings` | POST | Yes | Start recording session |
| `/recordings/:id` | GET | Owner | Get recording details |
| `/recordings/:id/upload` | PUT | Owner | Multipart upload |
| `/recordings/:id/process` | POST | Owner | Trigger processing |
| `/recordings/:id/download` | GET | Owner | Generate signed URL |

### FFmpeg Worker

```typescript
// recordingProcessor.ts
import { Worker } from 'bullmq';
import ffmpeg from '@ffmpeg/ffmpeg';

const processor = new Worker('recordings', async (job) => {
  const { recordingId, inputPath, format } = job.data;
  
  const { createLogger } = require('winston');
  const logger = createLogger();
  
  const ffmpegInstance = new ffmpeg.FFmpeg();
  
  // Download from S3
  await ffmpegInstance.FS('writeFile', 'input.mp4', await s3.getObject(inputPath));
  
  // Process based on format
  switch (format) {
    case 'mp3':
      await ffmpegInstance.run('-i input.mp4 -vn -ar 44100 -ac 2 -b:a 192k output.mp3');
      break;
    case 'wav':
      await ffmpegInstance.run('-i input.mp4 -vn -ar 48000 -ac 2 -f wav output.wav');
      break;
    default:
      await ffmpegInstance.run('-i input.mp4 -c:v copy -c:a copy output.mp4');
  }
  
  // Upload result
  const output = await ffmpegInstance.FS('readFile', `output.${format}`);
  await s3.upload({ key: `recordings/${recordingId}.${format}`, body: output });
  
  // Update status
  await prisma.recording.update({
    where: { id: recordingId },
    data: { status: 'ready', audioUrl: `s3://recordings/${recordingId}.${format}` }
  });
});
```

---

## Cloud APIs

### Authentication Flow (OAuth 2.0)

```
User → Frontend → Google/Apple OAuth Endpoint
    ↓
Receive Authorization Code
    ↓
Backend Exchange Code for Access Token
    ↓
Create/Link User Account
    ↓
Return JWT to Frontend
```

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});
```

---

## Database

See separate `Database.md` for detailed schema and indexing strategy.

---

## Caching

See separate `Architecture.md` for Redis caching strategy and key patterns.

---

## Queue System

### BullMQ Setup

```typescript
// jobs/recordingProcessor.ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);

export const recordingQueue = new Queue('recordings', { connection });

export const recordingWorker = new Worker('recordings', async (job) => {
  // Processing logic
}, { connection, concurrency: 5 });
```

### Queue Types

| Queue | Purpose | Worker Count |
|-------|---------|--------------|
| recordings | Audio processing, export | 5 |
| analytics | Event aggregation | 2 |
| notifications | Email/SMS | 3 |

---

## Future Microservices

| Service | Responsibility | Tech Stack |
|---------|----------------|------------|
| Gesture Service | ML inference for gesture recognition | Python + TensorFlow Serving |
| Audio Service | Real-time audio synthesis | Go + WebAssembly |
| Analytics Service | User behavior, practice analytics | ClickHouse + Kafka |
| Notification Service | Push, email, SMS | Node.js + Twilio/Nodemailer |
| Search Service | Full-text search | Elasticsearch |
| CDN Service | Media delivery | Cloudflare R2 + CDN |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=super-secret-key
JWT_REFRESH_SECRET=refresh-secret-key

# Storage
S3_ENDPOINT=https://r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# External APIs
STRIPE_SECRET_KEY=sk_live_...
```

---

## Error Handling

```typescript
// middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  
  if (err instanceof AuthError) {
    return res.status(401).json({ error: err.message });
  }
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  
  // Don't leak internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  res.status(500).json({ error: err.message, stack: err.stack });
};
```