# Architecture

## Overview

This application is built as a Next.js App Router project with a clear separation between app routes, reusable UI components, and storage logic.

## Core decisions

- Next.js App Router for routing and server/client boundaries
- TypeScript for safety and maintainability
- Tailwind CSS for a clean SaaS aesthetic and responsive mobile-first layout
- Local storage as the default MVP persistence layer with a Supabase-ready data shape
- Dedicated prompter route that keeps the playback experience visually separate from the normal app interface
- Utility-driven script logic so calculations like word count and reading time remain testable

## Persistence model

The app stores scripts in a private local storage implementation. The data shape mirrors what a Supabase `scripts` table would look like, which keeps the app ready for migration without a large rewrite.

## Teleprompter behavior

The prompter uses a browser-native animation frame loop to update scroll position. The animation state stays local to the component to avoid unnecessary React re-renders during playback.

## Security posture

The app is designed around a private-user model. Every script is associated with a user id and access checks are enforced in the app layer. In a production Supabase deployment, the same ownership model should be enforced with Row Level Security policies.

## Future extension

The current architecture is compatible with future additions such as IndexedDB caching, service workers, offline support, remote control, and richer collaborative features.
