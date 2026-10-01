# Fake News Detector API

Backend service for the Fake News Detector application. It provides account registration and login, accepts news text for AI-assisted assessment, and stores per-user analysis history in MongoDB.

## Contents

- [Overview](#overview)
- [Technology](#technology)
- [Project layout](#project-layout)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Install and run](#install-and-run)
- [HTTP API](#http-api)
- [Authentication](#authentication)
- [Analysis behavior](#analysis-behavior)
- [MongoDB models](#mongodb-models)
- [Errors and operational notes](#errors-and-operational-notes)
- [Security and production considerations](#security-and-production-considerations)

## Overview

The API is an Express application. It connects to MongoDB through Mongoose, uses signed JSON Web Tokens (JWTs) to protect analysis endpoints, and sends submitted article text to Google's Gemini `generateContent` API. Successful AI results are stored as analysis documents associated with the authenticated user.

The service currently exposes:

- `POST /api/auth/register` — create an account.
- `POST /api/auth/login` — verify credentials and issue a JWT.
- `POST /api/news/analyze` — analyze and persist submitted news text (JWT required).
- `GET /api/news/history` — retrieve the authenticated user's analysis history (JWT required).
- `GET /` — basic API liveness response.

## Technology

- Node.js with CommonJS modules
- Express 5
- MongoDB and Mongoose
- `bcryptjs` for password hashing
- `jsonwebtoken` for token signing and verification
- `axios` for the Gemini HTTP request
- `dotenv` for loading environment configuration
- `cors` for browser cross-origin requests

`groq-sdk` is listed as a dependency but is not used by the current server source; AI requests are made directly to the Gemini REST API using Axios.

## Project layout

```text
Server/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Registration and login handlers
│   └── newsController.js      # Analysis and history handlers
├── middleware/
│   └── authMiddleware.js      # Bearer JWT verification
├── models/
│   ├── Analysis.js            # Persisted analysis schema
│   └── User.js                # Account schema
├── routes/
│   ├── authRoutes.js          # /api/auth routes
│   └── newsRoutes.js          # /api/news routes
├── services/
│   └── llmService.js          # Gemini API integration
├── utils/
│   └── prompt.js              # Analysis prompt and output instructions
├── server.js                  # Express app, middleware, route mounting, listener
├── package.json
└── .env                       # Local secrets; do not commit
```

## Requirements

- A supported Node.js runtime and npm.
- A reachable MongoDB deployment (local or hosted).
- A Google Gemini API key and a model identifier accepted by the Gemini `generateContent` endpoint.

## Configuration

Create `Server/.env` for local development. The file is ignored by Git. Define:

| Variable | Purpose | Required by current code |
| --- | --- | --- |
| `PORT` | HTTP port; defaults to `3000` when unset. | No |
| `MONGO_URI` | MongoDB connection string passed to Mongoose. | Yes |
| `JWT_SECRET` | Secret used to sign and verify login tokens. | Yes |
| `GEMINI_API_KEY` | Credential placed in the Gemini API request URL. | Yes for analysis |
| `GEMINI_MODEL` | Gemini model name used in the `generateContent` URL. | Yes for analysis |

Example with placeholder values:

```dotenv
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/fake_news_detector
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=replace-with-your-key
GEMINI_MODEL=replace-with-a-supported-model-name
```

Do not use the example secret or commit real credentials. `dotenv.config()` is called by `server.js`, and the MongoDB connection is started during application startup. The application does not currently validate that required variables are present before using them.

## Install and run

From this directory:

```bash
npm install
npm run dev
```

`npm run dev` starts `server.js` through `npx nodemon`. For a regular start:

```bash
npm start
```

The server listens on `PORT`, or `3000` by default. On startup it attempts to connect to MongoDB and logs the configured HTTP address. If MongoDB connection fails, `config/db.js` logs the error and exits the process.

The root health response is:

```json
{
  "message": "Fake News Detector API is running."
}
```

The configured CORS origins are `http://localhost:5173` and `https://ai-fake-news-detector-blue.vercel.app`; credentials are enabled. Other browser origins are not allowed by this list unless the server configuration is changed.

## HTTP API

All request and response bodies are JSON. The server uses `express.json()` and currently has no separate API version prefix beyond `/api`.

### Register

`POST /api/auth/register`

Request:

```json
{
  "name": "Ada Example",
  "email": "ada@example.com",
  "password": "your-password"
}
```

All three fields are required. On success, returns HTTP `201`:

```json
{
  "message": "Registration successful.",
  "user": {
    "id": "<user-id>",
    "name": "Ada Example",
    "email": "ada@example.com"
  }
}
```

Missing values and an already existing email return HTTP `400`. Unexpected errors return HTTP `500`. Passwords are hashed with bcryptjs using 10 salt rounds; the raw password is not returned.

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "ada@example.com",
  "password": "your-password"
}
```

On success, returns HTTP `200` with a JWT and public user fields:

```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "name": "Ada Example",
    "email": "ada@example.com"
  }
}
```

Missing credentials return `400`; incorrect email or password returns `401`; unexpected errors return `500`. The token payload contains the user ID in `id` and expires after seven days.

### Analyze news

`POST /api/news/analyze` (JWT required)

Include the token in the `Authorization` header:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "text": "The news article or claim to assess."
}
```

Text must be non-empty after trimming and no longer than 10,000 JavaScript string characters. The submitted value itself is saved as provided. After Gemini returns a parseable result, the API stores it and responds with HTTP `200`:

```json
{
  "message": "News analyzed successfully.",
  "analysis": {
    "id": "<analysis-id>",
    "inputText": "The news article or claim to assess.",
    "verdict": "Uncertain",
    "confidence": 50,
    "explanation": "Short explanation of the assessment.",
    "redFlags": [],
    "createdAt": "<ISO timestamp>"
  }
}
```

An absent or blank text field and an over-limit input return `400`. Missing or invalid/expired bearer tokens return `401`. Analysis/AI or persistence failures are caught by the controller and returned as `500` with a `message` field.

### Get analysis history

`GET /api/news/history` (JWT required)

Send the same `Authorization: Bearer <jwt>` header. The response is HTTP `200`:

```json
{
  "history": [
    {
      "_id": "<analysis-id>",
      "userId": "<user-id>",
      "inputText": "...",
      "verdict": "Likely Real",
      "confidence": 75,
      "explanation": "...",
      "redFlags": [],
      "createdAt": "<ISO timestamp>",
      "updatedAt": "<ISO timestamp>"
    }
  ]
}
```

Records are filtered by the user ID in the verified JWT and sorted newest first. The history endpoint currently returns all matching records in one response; it does not implement pagination. Fetch failures return `500`.

## Authentication

The `protect` middleware requires an `Authorization` header beginning with `Bearer `. It verifies the token with `JWT_SECRET`, stores the decoded payload on `req.user`, and passes control to the route handler. The analysis controller uses `req.user.id` as the owner when saving and querying records.

The API does not currently expose logout, token refresh, password reset, or a user profile endpoint. A client can stop using a token locally; server-side token revocation is not implemented.

## Analysis behavior

`utils/prompt.js` instructs Gemini to assess credibility, sensational wording, missing sourcing/evidence, logical consistency, and signs of misinformation. The requested JSON shape is:

```json
{
  "verdict": "Likely Real",
  "confidence": 75,
  "explanation": "Short explanation of your analysis.",
  "redFlags": ["Example red flag"]
}
```

The intended verdict values are `Likely Real`, `Likely Fake`, and `Uncertain`; confidence is intended to be a number from 0 through 100. The service calls Gemini's `generateContent` endpoint with the configured model and API key, extracts the first candidate's first text part, removes JSON markdown fences if present, and parses the result with `JSON.parse`.

The backend currently trusts the parsed model result and persists it without validating that its keys, verdict, or confidence value match the prompt's requirements. A successful HTTP exchange with malformed or non-JSON model text therefore fails analysis rather than returning a normalized result. This assessment is AI-generated and the implementation does not independently verify claims against external sources.

## MongoDB models

### User

`User` documents contain:

- `name`: required string, trimmed.
- `email`: required, unique string, lowercased and trimmed.
- `password`: required string; registration stores a bcrypt hash.
- Mongoose `createdAt` and `updatedAt` timestamps.

### Analysis

`Analysis` documents contain:

- `userId`: required ObjectId reference to `User`.
- `inputText`: required string.
- `verdict`: required string.
- `confidence`: required number.
- `explanation`: required string.
- `redFlags`: array of strings, defaults to an empty array.
- Mongoose `createdAt` and `updatedAt` timestamps.

The model does not declare an enum or numeric range validator for verdict/confidence. Analysis ownership is enforced in the history query by filtering on the authenticated `userId`.

## Errors and operational notes

- There is no custom not-found handler, centralized error middleware, request logging, rate limiting, or graceful shutdown handler in the current application.
- The database connection is initiated before `app.listen`, but `connectDB()` is not awaited by `server.js`. Connection failure exits the process; the HTTP listener may otherwise be started while the connection attempt is still pending.
- Gemini request errors and parse errors are logged in `llmService.js`. Its current error rethrow expression constructs an `Error` incorrectly, which can result in an empty message and mask the original cause. The controller may consequently return a `500` with an unhelpful message for AI failures.
- `npm test` is a placeholder that exits with an error; no automated test suite is configured in this package.

## Security and production considerations

- Keep `.env` out of version control and use a long, random `JWT_SECRET` in deployed environments.
- Use HTTPS in production and restrict CORS to the exact trusted frontend origins.
- Add input validation for email/password and validate/sanitize the model response before persistence or returning it to clients.
- Consider request size limits, rate limits, pagination for history, and operational logging/monitoring before exposing the service broadly.
- The Gemini API key is included in the upstream URL query string by the current integration; protect logs and diagnostics from recording credential-bearing URLs.
- Analysis submissions contain user-provided text and are sent to the configured AI provider. Handle that data in accordance with the application's privacy requirements.
