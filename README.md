# CV Web API

A RESTful API for CV/resume creation, job application tracking, and management.

## Tech Stack

- **Bun** – Fast JavaScript runtime
- **Hono** – Lightweight web framework
- **Drizzle ORM** – Type-safe ORM (MySQL adapter)
- **MySQL** – Relational database
- **TypeScript** – Type safety

## Architecture

This project uses a **layered architecture**:

- **Repository Layer**: Handles direct database access and queries (Drizzle ORM).
- **Service Layer**: Contains business logic and ownership checks.
- **Controller Layer**: Handles HTTP requests, validation, and responses.

## Features

- CV/resume management (create, update, delete, list)
- Job application tracking

## Setup

Install dependencies:

```bash
bun install
```

Run the server:

```bash
bun dev
```

## Notes

- **MySQL Limitation**: MySQL does not support `INSERT ... RETURNING` (except for auto-incremented IDs). As a result, some operations require an extra database call to fetch the newly created or updated record.
- This project was bootstrapped with `bun init` using Bun v1.1.31.

---

For more details, see the source code and comments.
