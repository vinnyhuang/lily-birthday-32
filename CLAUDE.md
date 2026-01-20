# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**This is a birthday scrapbook web app specifically for Lily's 32nd Birthday.**

Guests receive unique invite links to create personalized scrapbook pages with photos, videos, and memories as a collaborative gift for Lily. All user-facing copy and messaging should reference "Lily's 32nd Birthday" to make the occasion clear and personal.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase, Prisma ORM
- **Storage**: AWS S3 with presigned URLs for direct uploads
- **UI**: shadcn/ui + Tailwind CSS v4 (warm, playful theme)
- **Deploy**: Vercel

## Common Commands

**Use pnpm for all commands (not npm).**

```bash
# Development
pnpm dev                 # Start dev server (port 3002)
pnpm build               # Production build
pnpm lint                # Run ESLint

# Database
pnpx prisma generate     # Generate Prisma client after schema changes
pnpx prisma db push      # Push schema changes to Supabase
pnpx prisma studio       # Open database GUI
```

## Project Structure

```
/app
  /admin              # Admin dashboard pages (login, tokens, pages)
  /api                # API routes
    /admin            # Admin APIs (login, tokens, pages)
    /invite/[token]   # Token validation and claiming
    /media            # Media CRUD operations
    /page/[pageId]    # Page data operations
    /upload           # Presigned URL generation
  /invite/[token]     # Guest invite landing page
  /page/[pageId]      # Page builder UI
/components
  /ui                 # shadcn components
  AdminNav.tsx        # Admin navigation bar
  GuestNameForm.tsx   # Name entry form for guests
  MediaGrid.tsx       # Media display grid with edit dialog
  MediaUploader.tsx   # Drag-drop upload component
/lib
  auth.ts             # Admin and guest session helpers
  db.ts               # Prisma client singleton
  s3.ts               # S3 presigned URL helpers
  generated/prisma    # Generated Prisma client
/prisma
  schema.prisma       # Database schema
```

## Architecture

### Guest Authentication Flow
Simple token-based access (no complex auth):
1. Host generates unique invite links via admin dashboard
2. Guest clicks link → enters name → session cookie set
3. Guest is redirected to their page builder

### Media Upload Pipeline
1. Client requests presigned URL from `/api/upload`
2. Client uploads directly to S3 using presigned URL
3. Client calls `/api/media` to create database record
4. Media appears in guest's page grid

### Admin Authentication
Simple password protection:
- Single shared password set via `ADMIN_PASSWORD` env var
- Session stored in httpOnly cookie (24 hour expiry)
- Can also pass password in `x-admin-password` header for API calls

### Core Data Models (prisma/schema.prisma)
- **InviteToken**: unique token, usage status
- **Guest**: name, linked to InviteToken
- **Page**: belongs to Guest, layout type, canvas state (JSON)
- **Media**: S3 key, URL, type, caption, location, dateTaken, position

## Design Guidelines

- Warm color palette (soft corals, creams, warm neutrals) defined in globals.css
- Mobile-first responsive design
- Generous border-radius (0.75rem base)
- shadcn components customized via CSS variables

## Environment Variables

```
DATABASE_URL=           # Supabase PostgreSQL connection string
AWS_ACCESS_KEY_ID=      # S3 credentials
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
ADMIN_PASSWORD=         # Admin dashboard password
NEXT_PUBLIC_APP_URL=    # Base URL for invite links
```

## Implemented Features

- Canvas-based page editor (Konva.js with react-konva)
- Layout templates (grid, collage, hero, freeform)
- Decorations (stickers, text, backgrounds)
- EXIF extraction (date taken, GPS coordinates via exifr)
- Google Maps integration (reverse geocoding, map view of photos)
- Google Places API for location autocomplete

## Future Features (Not Yet Implemented)

- Photo frames/borders
- PDF export
- Timeline view
- Story feed view

## Theming & Messaging

All user-facing pages should clearly indicate this is for **Lily's 32nd Birthday**:
- Home page: Welcome messaging for Lily's celebration
- Invite page: "You're invited to Lily's 32nd Birthday"
- Page builder: Context that memories are for Lily
- Admin dashboard: Event-specific branding

The visual design uses a warm, playful scrapbook aesthetic with coral, cream, and gold tones.
