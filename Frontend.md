# Mjolnir Frontend Build Brief

## Purpose

Build a complete production-grade frontend for Mjolnir, a lost-and-found community application. The experience should feel authored, editorial, and trustworthy rather than like a generic dashboard assembled from cards. The visual identity should support real people scanning posts quickly, contributing accurate information, and resolving items with confidence.

The current repository contains frontend service/model files under `src/main/resources/frontend/src`, but it does not yet contain a complete Vite application shell, route structure, page components, design system, or test setup. The frontend must be completed without changing the backend contract unless a necessary incompatibility is found and documented.

## Backend Contract

Local API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_LOCAL_USER_ID=local-user
```

The backend local profile uses MySQL and local filesystem uploads. Firebase is optional for authentication only.

### Public endpoints

- `GET /api/posts`
  - Returns active posts.
  - Optional query parameter: `type=LOST` or `type=FOUND`.
- `GET /api/posts/{id}`
  - Returns one post.

### Authenticated endpoints

In local mode, send:

```http
X-User-Id: local-user
X-User-Name: Local User
X-User-Email: local@example.test
```

When Firebase Auth is configured, send:

```http
Authorization: Bearer <Firebase ID token>
```

- `POST /api/auth/register`
  - Body: `{ "username": "Ada" }`
- `GET /api/auth/me`
- `GET /api/posts/mine`
- `POST /api/posts`
  - Body:

```json
{
  "title": "Black backpack",
  "description": "Black backpack with a silver zipper.",
  "category": "Bags",
  "type": "LOST",
  "location": "Main library",
  "pictureUrl": ""
}
```

- `PATCH /api/posts/{id}/resolve`
  - Returns `204`.
  - Only the post owner can resolve an active post.
- `POST /api/uploads`
  - Multipart field: `file`.
  - Returns `{ "url": "/uploads/posts/<filename>" }`.

### Post shape

```ts
interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  pictureUrl: string;
  category: string;
  type: 'LOST' | 'FOUND';
  status: 'ACTIVE' | 'RESOLVED';
  location: string;
  currentCustody: string;
  createdAt: string;
}
```

Do not write posts, profiles, or images directly to Firestore or Firebase Storage. Use the API service layer.

## Product Experience

Create these core flows:

1. **Browse**
   - Active lost-and-found feed.
   - Distinct LOST and FOUND filters.
   - Search by title, description, category, and location on the client.
   - Empty, loading, error, and retry states.
   - Responsive result density for desktop, tablet, and mobile.

2. **Post detail**
   - Large, inspectable image treatment when an image exists.
   - Clear type/status/location/category metadata.
   - Full description.
   - Owner-only Resolve action.
   - Copyable/shareable URL.
   - Not-found and failed-request states.

3. **Create post**
   - Validated title, description, category, type, and location fields.
   - Image preview before upload.
   - Upload progress and failure recovery.
   - Disable duplicate submission while saving.
   - Redirect to the created post after success.

4. **My posts**
   - Authenticated list of the current user's posts.
   - Active/resolved state distinction.
   - Resolve action with confirmation and optimistic or clearly pending UI.

5. **Profile/auth boundary**
   - Local development mode should work with `VITE_LOCAL_USER_ID` and no Firebase configuration.
   - Keep Firebase Auth integration optional and isolated behind an auth adapter.
   - Never expose service-account credentials in frontend code.

## Creative Direction

Choose a strong visual language before coding. The default direction should be a field-notes / civic archive aesthetic: warm paper or mineral neutrals, one confident signal color for LOST, a separate grounded color for FOUND, precise dark typography, and restrained utility accents. It should feel like a carefully designed public noticeboard with the clarity of a modern product, not a social-media clone.

Use an expressive display typeface for page titles and a highly legible text face for controls and metadata. Do not use default system stacks, Inter, Roboto, or a generic SaaS font pairing. Use a licensed or Google Font that can be loaded reliably, with a sensible fallback.

Use real visual hierarchy:

- Feed pages should prioritize scanning and comparison.
- Detail pages should prioritize inspection and trust.
- Composer pages should prioritize confidence and error prevention.
- Navigation should remain compact and useful.

Avoid:

- Purple-on-white startup styling.
- Giant hero sections that delay the actual feed.
- Nested cards and excessive floating panels.
- Uniform rounded rectangles for every control.
- Decorative gradients, blobs, fake testimonials, or marketing copy.
- Generic three-column dashboard layouts.
- Placeholder lorem ipsum or invented backend fields.
- UI text explaining obvious interactions or keyboard shortcuts.

Use icons from an established icon library such as Lucide when the project supports it. Icon-only buttons must have accessible labels/tooltips. Text buttons are appropriate for clear actions such as `Create post` and `Resolve item`.

## Technical Requirements

- Use React and TypeScript with the existing Vite-compatible environment.
- Use a router with stable routes:
  - `/`
  - `/post/:id`
  - `/create`
  - `/my-posts`
- Keep API calls in a typed service/query layer rather than inside presentational components.
- Centralize auth state and support local-header auth plus optional Firebase token auth.
- Keep API errors typed and render useful user-facing messages.
- Use semantic HTML, keyboard navigation, visible focus states, proper labels, and accessible dialog behavior.
- Use responsive layout constraints rather than viewport-scaled font sizes.
- Add route-level loading and error boundaries.
- Preserve scroll position and avoid layout shift during image loading.
- Add image constraints and safe previews. Do not trust filenames for rendering.
- Do not put secrets in `.env.example`; only include public Firebase web configuration placeholders and local development values.
- Keep `VITE_*` variables limited to values safe for browser exposure.

## Required States

Every data-backed screen must handle:

- First load.
- Refreshing existing data.
- Empty results.
- API failure with retry.
- Offline or slow network behavior.
- Unauthorized write action.
- Image upload progress.
- Image upload failure.
- Form validation failure.
- Successful submission.
- Resolve confirmation, pending, success, conflict, and failure.

## Testing and Verification

Add focused tests for:

- API request headers in local mode.
- Post filtering and search behavior.
- Form validation.
- Upload failure handling.
- Resolve action visibility and behavior.
- Route rendering for loading, empty, error, and success states.

Before finishing:

1. Run the frontend typecheck.
2. Run lint and unit tests.
3. Build the production bundle.
4. Start the local backend and verify the UI against the real API.
5. Test desktop and mobile layouts.
6. Verify that no direct Firestore/Storage data writes remain.
7. Verify that keyboard navigation and screen-reader labels are usable.
8. Check that all image URLs and API errors render gracefully.

## Implementation Prompt

Use the following prompt with a coding agent to build the frontend:

```text
Build the complete production-grade React + TypeScript frontend for the Mjolnir lost-and-found application in this repository.

First inspect the existing frontend service/model files and backend API contract in Frontend.md. Do not invent endpoints or write directly to Firestore/Firebase Storage. Use the existing REST API and local filesystem upload endpoint. Preserve the optional Firebase Auth boundary and make local development work with VITE_LOCAL_USER_ID without Firebase configuration.

Create a real application, not a landing page or a mockup. Implement routing for the feed, post detail, create post, and my posts. Build the full data lifecycle: loading, refreshing, empty, error, retry, unauthorized, upload progress, upload failure, form validation, successful creation, resolve confirmation, resolve conflict, and resolved state.

Use a deliberate visual direction: an authored field-notes / civic archive aesthetic with warm mineral neutrals, a restrained signal palette, expressive display typography, precise metadata, strong image inspection, and editorial hierarchy. Make LOST and FOUND visually distinguishable without relying on color alone. Use compact navigation and make the feed the first useful screen. Avoid generic SaaS dashboard patterns, excessive cards, purple gradients, oversized marketing heroes, decorative blobs, fake content, and placeholder copy.

Use a real design system with CSS variables for color, type scale, spacing, borders, shadows, motion, and breakpoints. Use responsive constraints so text, buttons, cards, images, and form controls never overflow or shift unexpectedly. Use meaningful page-load and list-reveal motion only where it improves orientation. Respect reduced-motion preferences.

Use semantic HTML and accessible interactions throughout. Add labels, keyboard operation, visible focus states, logical heading hierarchy, alt text, dialog semantics, toast/status announcements, and tooltips for unfamiliar icon buttons. Use Lucide or the existing icon library instead of drawing manual SVG icons.

Keep API and auth logic separate from UI components. Add typed request/response helpers, consistent error parsing, and an auth adapter that sends X-User-Id in local mode or a Firebase ID token when configured. Add image preview, multipart upload, upload progress, safe failure recovery, and display uploaded image URLs from the API.

Add focused unit/component tests for API headers, search/filter behavior, validation, upload errors, resolve behavior, and loading/empty/error/success states. Run typecheck, lint, tests, and a production build. Start the local backend and verify the application against the real API with the sample data described in the repository context. Fix all type, runtime, accessibility, and responsive layout issues before finishing.

At the end, report the files created, commands run, verification results, and any backend contract limitation that prevented a feature from being implemented.
```
