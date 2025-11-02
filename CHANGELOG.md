# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (2025-11-02)

#### Critical: Supabase Environment Variables
- **BREAKING CHANGE**: Renamed environment variables to use `PUBLIC_` prefix
  - `SUPABASE_URL` → `PUBLIC_SUPABASE_URL`
  - `SUPABASE_KEY` → `PUBLIC_SUPABASE_ANON_KEY`
- **Fixed**: React component hydration error "supabaseUrl is required"
- **Fixed**: Supabase client not working in browser (client-side React components)
- **Added**: Guard clause to check for missing environment variables
- **Added**: `.env.example` file with documented environment variables
- **Updated**: `README.md` with environment variables documentation

**Migration Required:**
If you have an existing `.env.local` file, update variable names:
```bash
# Old (won't work)
SUPABASE_URL=...
SUPABASE_KEY=...

# New (required)
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

### Added (2025-11-02)

#### Settings View Implementation
- **New page**: `/ustawienia` - User profile settings page with authentication guard
- **New component**: `SettingsForm` - Interactive React component for managing profile settings
- **Feature**: Default AI difficulty level selection (A1-C2)
- **Feature**: Automatic save on change (no "Save" button required)
- **Feature**: Optimistic UI updates with rollback on error
- **Feature**: Toast notifications for success/error feedback
- **Feature**: Loading spinner during API calls
- **Feature**: Comprehensive error handling (401, 404, 422, 500)
- **UI**: "Ustawienia" link added to main navigation

#### Technical Improvements
- Implemented server-side authentication check on settings page
- Added SSR support for protected settings route (`prerender: false`)
- Enhanced error messages with user-friendly Polish translations
- Full ARIA accessibility support (labels, descriptions, keyboard navigation)
- Responsive design optimized for mobile, tablet, and desktop
- React.memo optimization for SettingsForm component

#### Documentation
- Created comprehensive testing plan (`tests/settings-view-TESTING.md`)
- Added implementation summary (`.docs/ui_implementation_plan/settings-view-IMPLEMENTATION-SUMMARY.md`)
- Added fix documentation (`.docs/fixes/supabase-env-vars-fix.md`)
- Added detailed JSDoc comments to all functions

#### Files Modified
- `src/pages/ustawienia.astro` - NEW
- `src/components/SettingsForm.tsx` - NEW
- `src/layouts/MainLayout.astro` - Added settings link to navigation
- `src/db/supabase.client.ts` - Updated to use PUBLIC_ env vars
- `src/env.d.ts` - Updated TypeScript definitions
- `.env.local` - Updated variable names (BREAKING)
- `.env.example` - NEW
- `README.md` - Updated with setup instructions
- `tests/settings-view-TESTING.md` - NEW
- `.docs/ui_implementation_plan/settings-view-IMPLEMENTATION-SUMMARY.md` - NEW
- `.docs/fixes/supabase-env-vars-fix.md` - NEW

### Changed
- Navigation now includes "Ustawienia" link for authenticated users
- MainLayout header updated with new navigation item
- Environment variable naming convention (BREAKING CHANGE)

### Technical Details
- **API Integration**: 
  - GET `/api/profile` - Fetches user profile on page load (server-side)
  - PATCH `/api/profile` - Updates default AI level (client-side)
- **State Management**: Local React state with optimistic updates
- **UI Components**: Shadcn/ui Card, Label, Select + Sonner toast
- **Validation**: Zod schema validation on API layer
- **Type Safety**: Full TypeScript coverage with DTOs

---

## [Previous Releases]

_To be documented_

---

## Notes

### Semantic Versioning Guide
- **MAJOR** version: Incompatible API changes (like the env vars rename)
- **MINOR** version: New functionality in a backwards compatible manner
- **PATCH** version: Backwards compatible bug fixes

### Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
