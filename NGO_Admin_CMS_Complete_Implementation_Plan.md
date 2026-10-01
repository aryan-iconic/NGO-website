# NGO Website --- Complete Admin CMS, Backend Integration Boundary, Public Synchronization & Zero-Known-Bug Implementation Plan

**Project:** Shri Nityanikunj Ras Seva Sansthan Trust website\
**Document type:** Agent execution specification / overnight
implementation plan\
**Primary objective:** Turn the existing Admin area into a complete,
reliable CMS and operational backend UI for every dynamic part of the
public website.

------------------------------------------------------------------------

## 0. How this document must be used

This is an **execution specification**, not a suggestion list.

The coding agent must:

1.  Inspect the existing repository before changing architecture.
2.  Verify whether each requested capability already exists.
3.  If it exists and is correct, **keep it and move forward**.
4.  If it exists but is incomplete, inaccurate, disconnected, or broken,
    **repair it**.
5.  If it does not exist, **implement it**.
6.  Never duplicate a feature that already works correctly.
7.  Never replace working public UI unnecessarily.
8.  Never consider a feature complete merely because a button or form
    exists.
9.  Test every Admin → persistence/API → Public flow.
10. Continue discovering missing functionality beyond the examples in
    this document.

The user will handle/finalize the actual API implementation before final
integration testing. The agent must therefore build clean API
integration boundaries, use realistic interfaces/adapters/mocks only
where necessary, and make the code ready for the real API.

### Definition of complete

A feature is complete only when:

> Admin action → validation → API/data layer → persistence contract →
> public API/data → public UI → correct visible result →
> error/empty/loading states → tested.

------------------------------------------------------------------------

# 1. CURRENT PUBLIC-SITE FACTS TO PRESERVE

The currently deployed public site was inspected during preparation of
this plan.

### `/events`

The page is titled **Our Initiatives** and currently shows:

> No upcoming initiatives at the moment.

It also exposes public navigation to Campaigns, Donate, Gallery, Blog,
Our Story, Transparency, Volunteer, Contact, and legal pages.

This means the page must be treated as a real content collection, not as
a permanently static empty page.

### `/gallery`

The public Gallery currently contains these visible filters:

-   All
-   Initiatives
-   Seva
-   Community
-   Education
-   Spiritual
-   Volunteers

The public page currently contains no visible gallery items in the
inspected state, but the category structure exists and must be
preserved.

### `/blog`

The public Blog currently contains:

-   Blog heading
-   "Stories and updates from the field."
-   "No posts published yet."

This must become a complete Blog CMS while preserving the existing
public design.

### Important

These observations are a **baseline**, not a substitute for repository
inspection.

The agent must inspect the actual source code and current implementation
before deciding what needs to be changed.

------------------------------------------------------------------------

# 2. EXISTING ADMIN ROUTES

The current Admin area contains:

-   `/admin`
-   `/admin/campaigns`
-   `/admin/seva-areas`
-   `/admin/donations`
-   `/admin/recurring`
-   `/admin/people`
-   `/admin/content`
-   `/admin/social`
-   `/admin/audit-logs`
-   `/admin/settings`

The implementation must first audit every existing route.

Do not assume these screens are correct.

For each route determine:

-   Does the page render?
-   Does the page load actual data?
-   Does it use mock data?
-   Can records be created?
-   Can records be edited?
-   Can records be deleted/archived?
-   Can records be previewed?
-   Can records be published?
-   Can records be unpublished?
-   Does media upload work?
-   Does validation work?
-   Does error handling work?
-   Does the change persist?
-   Does the public site reflect it?
-   Does refresh preserve the change?
-   Is authorization enforced?
-   Are there console/build errors?
-   Are there missing API calls?
-   Are there placeholder controls?

------------------------------------------------------------------------

# 3. REQUIRED ADMIN MODULE MAP

The final Admin system should cover:

1.  Dashboard
2.  Campaigns
3.  Seva Areas
4.  Initiatives / Events
5.  Gallery
6.  Blog
7.  Donations
8.  Monthly Giving / Recurring
9.  People
10. Content / Pages
11. Social Media
    -   Instagram
    -   YouTube
12. Audit Logs
13. Settings
14. Shared Media handling
15. Translation/i18n management where required

New routes may be added if the existing structure does not provide an
appropriate place.

Preferred new routes:

-   `/admin/initiatives`
-   `/admin/gallery`
-   `/admin/blog`

If the existing Content architecture can legitimately manage one of
these as a collection without creating poor UX, it may be reused, but do
not force collection management into a static-page editor.

------------------------------------------------------------------------

# 4. PHASE 0 --- REPOSITORY DISCOVERY BEFORE IMPLEMENTATION

Do this first.

Do not start coding random components.

Inspect:

-   package manager
-   framework
-   routing
-   app structure
-   Admin structure
-   public structure
-   API clients
-   server actions
-   route handlers
-   database/schema files
-   ORM
-   storage/upload code
-   authentication
-   authorization
-   state management
-   form library
-   validation library
-   rich-text editor
-   i18n
-   caching/revalidation
-   tests
-   build scripts
-   lint scripts
-   typecheck scripts
-   environment variables
-   deployment configuration

Search for:

-   `TODO`
-   `FIXME`
-   `mock`
-   `dummy`
-   `sample`
-   `placeholder`
-   `hardcoded`
-   `coming soon`
-   `console.log`
-   `any`
-   empty handlers
-   fake API responses
-   disabled buttons
-   commented-out functionality

Do not blindly remove these. Determine whether each occurrence is
intentional.

------------------------------------------------------------------------

# 5. PUBLIC FEATURE INVENTORY

Create an internal inventory of every public route.

At minimum inspect:

-   `/`
-   `/campaigns`
-   campaign detail routes
-   `/events`
-   initiative detail routes if present
-   `/gallery`
-   `/blog`
-   blog detail routes if present
-   Seva routes
-   Our Story
-   Transparency
-   Volunteer
-   Contact
-   Donate
-   legal pages
-   any additional routes discovered in the repository

For each page record:

  -------------------------------------------------------------------------------------------
  Route   Content   Dynamic?   Admin    Existing   Existing   Media   Translation   Publish
                               source   API        DB model                         state
  ------- --------- ---------- -------- ---------- ---------- ------- ------------- ---------

  -------------------------------------------------------------------------------------------

The agent must fill this internally and use it to drive implementation.

------------------------------------------------------------------------

# 6. PUBLIC → ADMIN CONTROL AUDIT

For every visible public element ask:

> If the client asks to change this tomorrow, can they do it without
> changing source code?

If YES:

-   verify it works correctly.

If NO and it is intended to be dynamic:

-   add the appropriate CMS capability.

Examples:

-   campaign title
-   campaign cover
-   campaign gallery
-   campaign video
-   initiative title
-   initiative cover
-   gallery image
-   gallery category
-   blog title
-   blog cover
-   blog content
-   social post
-   homepage featured content
-   contact details
-   about content

Do not turn purely structural UI into unnecessary database content.

------------------------------------------------------------------------

# 7. EXISTING FEATURE RULE

For every feature:

### Case A --- Exists and correct

Do not rebuild.

Verify it and continue.

### Case B --- Exists but incomplete

Repair it.

### Case C --- Exists but disconnected

Connect it to the correct API/data source.

### Case D --- Exists visually but is fake/mock

Replace the fake behavior with real CMS/data-layer behavior.

### Case E --- Does not exist

Implement it.

### Case F --- Public page exists but Admin control does not

Implement Admin control and public synchronization.

This decision process must be applied throughout the project.

------------------------------------------------------------------------

# 8. UNIVERSAL CMS LIFECYCLE

For content entities, use a consistent lifecycle where appropriate:

-   Draft
-   Published
-   Unpublished
-   Archived

The exact database enum/status naming should follow the existing
architecture.

Admin actions:

-   Create
-   Save
-   Edit
-   Preview
-   Publish
-   Unpublish
-   Archive
-   Delete where appropriate
-   Duplicate where useful
-   Reorder where relevant

### Important

"Delete" must not be a fake UI action.

It must actually remove/archive the record according to the chosen data
model and must not leave broken public references.

------------------------------------------------------------------------

# 9. UNIVERSAL CRUD UX

Every collection Admin screen should have:

### List

-   Search
-   Filter
-   Sort
-   Pagination if needed
-   Status indicator
-   Created/updated information
-   Actions

### Create

-   Complete validated form
-   Save draft
-   Save/publish where appropriate

### Edit

-   Load current persisted data
-   Preserve unchanged values
-   Correctly update changed values

### Preview

-   Public-style preview
-   Draft content must remain non-public

### Publish

-   Explicit publish action
-   Success feedback
-   Public verification

### Unpublish

-   Explicit unpublish action
-   Public verification

### Delete/archive

-   Confirmation
-   Safe handling
-   Success/error feedback

------------------------------------------------------------------------

# 10. CAMPAIGNS --- COMPLETE CMS

Existing route:

`/admin/campaigns`

Audit and complete it.

## Campaign list

Support:

-   search
-   category filter
-   status filter
-   featured filter
-   date filter if appropriate
-   sorting
-   pagination if required
-   preview
-   edit
-   publish
-   unpublish
-   delete/archive

## Campaign fields

Inspect the current public campaign implementation and database before
finalizing fields.

Likely fields:

-   id
-   title
-   slug
-   short description
-   full description
-   category
-   location
-   start date
-   end date
-   goal/target amount
-   donation configuration
-   featured
-   display order
-   status
-   cover media
-   gallery media
-   video/media
-   SEO title
-   SEO description
-   OG image
-   createdAt
-   updatedAt

Do not add meaningless fields simply because they appear in this list.

------------------------------------------------------------------------

# 11. CAMPAIGN COVER IMAGE

This is explicitly known to be incomplete and must be fixed.

Admin must be able to:

-   select image
-   upload image
-   preview image
-   replace image
-   remove image
-   save image association
-   handle upload errors
-   show loading/progress
-   show validation errors

Public campaign listing/detail must use the saved cover.

No hardcoded cover should override the CMS record.

------------------------------------------------------------------------

# 12. CAMPAIGN GALLERY

Admin must be able to:

-   upload multiple images
-   add existing media where supported
-   remove individual images
-   reorder images
-   preview images
-   replace images
-   add alt text if supported
-   save gallery state

Public campaign detail must display the published gallery.

No gallery:

-   hide gallery section or use the existing intended empty behavior.

------------------------------------------------------------------------

# 13. CAMPAIGN VIDEO

Audit whether current implementation supports:

-   external video URL
-   YouTube
-   Vimeo
-   uploaded video
-   thumbnail

Support the methods appropriate to the current backend.

Admin must be able to:

-   add
-   edit
-   preview
-   remove
-   save

Invalid URLs must be rejected.

Public video section must not render when no valid published video
exists.

------------------------------------------------------------------------

# 14. CAMPAIGN PUBLIC SYNC TEST

Mandatory workflow:

1.  Login.
2.  Create campaign.
3.  Add title.
4.  Add description.
5.  Add cover.
6.  Add gallery.
7.  Add video.
8.  Save draft.
9.  Preview.
10. Verify preview.
11. Publish.
12. Open public campaigns page.
13. Verify card.
14. Open campaign detail.
15. Verify every field.
16. Edit title.
17. Save.
18. Refresh public page.
19. Verify title changed.
20. Unpublish.
21. Verify public visibility changes.
22. Republish.
23. Verify restoration.
24. Delete/archive.
25. Verify no broken links.

------------------------------------------------------------------------

# 15. INITIATIVES / EVENTS CMS

Public route:

`/events`

This must be treated as a collection.

Create/complete:

`/admin/initiatives`

Use a name consistent with the existing product terminology if "Events"
is already used internally, but preserve "Our Initiatives" in the public
UI where appropriate.

## Initiative fields

First inspect public detail/list UI.

Potential fields:

-   id
-   title
-   slug
-   short description
-   full description
-   cover image
-   gallery
-   date
-   start time
-   end time
-   location
-   address
-   category
-   CTA
-   registration URL
-   featured
-   display order
-   status
-   SEO title
-   SEO description
-   OG image
-   createdAt
-   updatedAt

Only implement fields actually useful to the product.

------------------------------------------------------------------------

# 16. INITIATIVE CRUD

Admin must support:

-   Create
-   Edit
-   Save draft
-   Preview
-   Publish
-   Unpublish
-   Archive
-   Delete
-   Duplicate if useful
-   Reorder
-   Search
-   Filter
-   Media management

------------------------------------------------------------------------

# 17. INITIATIVE PUBLIC LIST

Published initiatives must appear on `/events`.

Draft/unpublished initiatives must not appear.

No initiatives:

-   preserve the current empty-state behavior.

Do not leave an empty CMS list hardcoded.

------------------------------------------------------------------------

# 18. INITIATIVE DETAIL

Search the repository for a detail route.

If one exists:

-   connect it to CMS data.

If the product architecture expects individual initiative pages but one
does not exist:

-   implement it only if consistent with the current design and routing.

The same initiative record must drive:

-   list card
-   detail page
-   image
-   description
-   date
-   location
-   CTA

Do not duplicate content.

------------------------------------------------------------------------

# 19. GALLERY CMS

Public route:

`/gallery`

Create/complete:

`/admin/gallery`

The current public categories are:

-   All
-   Initiatives
-   Seva
-   Community
-   Education
-   Spiritual
-   Volunteers

Preserve these categories unless source inspection shows the actual
implementation differs.

------------------------------------------------------------------------

# 20. GALLERY DATA MODEL

A gallery item should support, where appropriate:

-   id
-   image/media
-   title
-   caption
-   description
-   category
-   related campaign
-   related initiative
-   related seva area
-   date
-   location
-   alt text
-   featured
-   display order
-   status
-   createdAt
-   updatedAt

Do not create all relations if the existing architecture does not
require them.

------------------------------------------------------------------------

# 21. GALLERY ADMIN

Support:

-   Add item
-   Upload image
-   Replace image
-   Edit metadata
-   Select category
-   Preview
-   Publish
-   Unpublish
-   Delete/archive
-   Reorder
-   Search
-   Filter by category
-   Filter by status

If video/gallery media is already supported publicly, add video support
consistently.

------------------------------------------------------------------------

# 22. GALLERY CATEGORY FILTER TEST

After publishing items in different categories:

-   All → all published
-   Initiatives → only Initiative items
-   Seva → only Seva items
-   Community → only Community items
-   Education → only Education items
-   Spiritual → only Spiritual items
-   Volunteers → only Volunteer items

Unpublished items must not appear.

Deleted items must not appear.

------------------------------------------------------------------------

# 23. BLOG CMS

Public route:

`/blog`

Create/complete:

`/admin/blog`

Blog is a collection, not just a static page.

------------------------------------------------------------------------

# 24. BLOG POST DATA MODEL

Inspect the existing public blog/detail design.

Likely fields:

-   id
-   title
-   slug
-   excerpt
-   content
-   cover image
-   author
-   publication date
-   category
-   tags
-   featured
-   status
-   SEO title
-   SEO description
-   OG image
-   createdAt
-   updatedAt

Implement only fields that fit the current application.

------------------------------------------------------------------------

# 25. BLOG EDITOR

Admin must support:

-   title
-   slug
-   excerpt
-   article content
-   cover image
-   author
-   category
-   tags
-   publication date
-   featured
-   SEO

If rich text is already present, reuse it.

If not, use a suitable existing project dependency rather than adding
unnecessary complexity.

The editor must prevent unsafe HTML/script injection.

------------------------------------------------------------------------

# 26. BLOG LIFECYCLE

Required:

-   Create draft
-   Save
-   Edit
-   Preview
-   Publish
-   Unpublish
-   Archive/delete

Drafts must never appear publicly.

------------------------------------------------------------------------

# 27. BLOG PUBLIC SYNC

Workflow:

1.  Create post.
2.  Save draft.
3.  Verify it does not appear publicly.
4.  Preview it.
5.  Verify preview.
6.  Publish.
7.  Verify `/blog`.
8.  Open article detail if supported.
9.  Edit.
10. Verify public update.
11. Unpublish.
12. Verify removal.
13. Republish.
14. Verify restoration.
15. Delete/archive.
16. Verify no broken public route.

------------------------------------------------------------------------

# 28. SEVA AREAS

Existing:

`/admin/seva-areas`

Audit fully.

Required where applicable:

-   Create
-   Edit
-   Delete/archive
-   Preview
-   Publish
-   Unpublish
-   Image upload
-   Reorder
-   Description
-   Category
-   Translation
-   SEO
-   Public synchronization

Do not assume this module is already complete.

------------------------------------------------------------------------

# 29. SOCIAL MEDIA --- INSTAGRAM

Existing:

`/admin/social`

The Instagram system must become genuinely dynamic.

Admin:

-   Add
-   Edit
-   Delete
-   Preview
-   Publish
-   Unpublish
-   Reorder

Fields may include:

-   URL
-   post reference
-   image/thumbnail
-   caption
-   title
-   display order
-   status

Use the existing public homepage design.

------------------------------------------------------------------------

# 30. SOCIAL MEDIA --- YOUTUBE

Admin:

-   Add
-   Edit
-   Delete
-   Preview
-   Publish
-   Unpublish
-   Reorder

Fields:

-   URL
-   video ID
-   title
-   description/caption
-   thumbnail
-   display order
-   status

Validate YouTube URLs and derive the video ID safely.

------------------------------------------------------------------------

# 31. SOCIAL EMPTY-SECTION RULE

Instagram:

Zero published items:

→ entire Instagram section hidden.

One or more:

→ render section.

YouTube:

Zero published items:

→ entire YouTube section hidden.

One or more:

→ render section.

Do not display empty placeholders.

------------------------------------------------------------------------

# 32. CONTENT / STATIC PAGES

Existing:

`/admin/content`

Audit all public pages linked under:

### About

-   Our Story
-   Transparency
-   Volunteer
-   Contact

### Legal

-   Privacy Policy
-   Terms
-   Donation Policy
-   Refund Policy

Also inspect any other pages in the source.

For each page determine whether it should be:

-   static code
-   editable content document
-   collection
-   configuration

------------------------------------------------------------------------

# 33. CONTENT PAGE EDITOR

Where a page is CMS-managed, support:

-   title
-   content
-   hero/cover image where applicable
-   additional media
-   SEO title
-   SEO description
-   OG image
-   publish state
-   preview

Preserve the existing visual page structure.

Do not turn a custom-designed page into an ugly generic text editor.

------------------------------------------------------------------------

# 34. HOMEPAGE CONTENT AUDIT

Inspect the entire homepage.

For every section:

-   identify source
-   identify whether dynamic
-   identify Admin control
-   identify whether hardcoded

Potential dynamic sections:

-   Hero content
-   Featured campaigns
-   Initiatives
-   Seva
-   Gallery
-   Blog
-   Instagram
-   YouTube
-   About preview
-   donation CTA
-   statistics
-   testimonials
-   announcements

Implement Admin controls for client-editable content.

Do not unnecessarily database-ify layout structure.

------------------------------------------------------------------------

# 35. PEOPLE MODULE

Existing:

`/admin/people`

Audit what this controls.

If people appear publicly, support appropriate:

-   name
-   role
-   photo
-   bio
-   social links
-   ordering
-   publish state

Do not expose private donor information.

------------------------------------------------------------------------

# 36. DONATIONS MODULE

Existing:

`/admin/donations`

This is operational/payment data, not ordinary CMS content.

Audit:

-   donor
-   amount
-   payment status
-   transaction/reference ID
-   campaign association
-   timestamp
-   filters
-   search
-   export if already supported/required

Do not allow accidental mutation of immutable payment information.

Do not expose payment secrets.

------------------------------------------------------------------------

# 37. MONTHLY GIVING

Existing:

`/admin/recurring`

Audit:

-   donor/subscriber
-   amount
-   frequency
-   status
-   payment status
-   campaign relation
-   created date
-   cancellation
-   failures

Never expose payment credentials.

------------------------------------------------------------------------

# 38. AUDIT LOGS

Existing:

`/admin/audit-logs`

Important Admin actions should generate audit records where the backend
supports it.

Examples:

-   login
-   logout
-   create
-   edit
-   delete
-   publish
-   unpublish
-   media upload
-   settings change
-   campaign changes
-   initiative changes
-   gallery changes
-   blog changes
-   social changes

Do not log:

-   passwords
-   API keys
-   payment credentials
-   sensitive secrets

------------------------------------------------------------------------

# 39. SETTINGS

Existing:

`/admin/settings`

Audit and complete.

Possible settings:

-   logo
-   brand name
-   contact email
-   phone
-   address
-   social links
-   map/location
-   default SEO
-   default OG image
-   supported languages
-   donation settings where appropriate

Brand name should be protected from automatic translation.

------------------------------------------------------------------------

# 40. SHARED MEDIA SYSTEM

Media is cross-cutting infrastructure.

Do not implement separate incompatible upload mechanisms for Campaigns,
Gallery, Blog, Initiatives and Seva.

Create/reuse a shared media service/component.

Support:

-   image upload
-   video upload if supported
-   preview
-   delete
-   replace
-   alt text
-   metadata
-   ordering

Validation:

-   MIME type
-   extension
-   file size
-   relevant dimensions
-   upload failure
-   cancelled upload

------------------------------------------------------------------------

# 41. MEDIA REFERENCES

Do not scatter raw URLs throughout content objects if the architecture
can use stable media IDs/references.

Preferred conceptual structure:

Content entity → media reference → media/storage layer → URL

Follow the existing backend architecture if it already provides a
suitable model.

------------------------------------------------------------------------

# 42. TRANSLATION / I18N

The website requirement is dynamic multilingual content.

Audit existing i18n first.

Static UI and dynamic CMS content must both be considered.

Translatable examples:

-   headings
-   descriptions
-   campaigns
-   initiatives
-   gallery captions
-   blog posts
-   Seva content
-   About
-   Contact
-   navigation
-   footer
-   CTAs
-   social captions
-   legal content

Do not translate:

-   brand name
-   email
-   phone
-   technical IDs
-   URLs where inappropriate

------------------------------------------------------------------------

# 43. TRANSLATION FALLBACK

For requested language:

1.  Use translated value if available.
2.  Otherwise fall back to default language.
3.  Never display:
    -   `undefined`
    -   `null`
    -   translation keys
    -   blank content caused by missing translation.

Admin should be able to manually edit generated translations if the
architecture supports automatic translation.

------------------------------------------------------------------------

# 44. API INTEGRATION BOUNDARY

The user will implement/connect the API before final testing.

The frontend/Admin implementation must therefore:

-   centralize API calls
-   define typed request/response interfaces
-   isolate API dependencies
-   avoid raw fetch calls scattered through components
-   avoid hardcoded fake responses
-   make API replacement straightforward

Use existing API abstractions if present.

------------------------------------------------------------------------

# 45. REQUIRED API CONTRACT COVERAGE

The exact endpoint names are determined by the backend.

The frontend must conceptually support:

## Auth

-   login
-   logout
-   current session/user

## Campaigns

-   list
-   detail
-   create
-   update
-   delete/archive
-   publish
-   unpublish
-   reorder
-   media

## Initiatives

-   list
-   detail
-   create
-   update
-   delete/archive
-   publish
-   unpublish
-   reorder
-   media

## Gallery

-   list
-   detail
-   create
-   update
-   delete/archive
-   publish
-   unpublish
-   reorder
-   media

## Blog

-   list
-   detail
-   create
-   update
-   delete/archive
-   publish
-   unpublish
-   media

## Seva

-   list
-   detail
-   create
-   update
-   delete/archive
-   publish
-   unpublish
-   reorder
-   media

## Social

-   Instagram CRUD
-   YouTube CRUD
-   publish/unpublish
-   reorder

## Content

-   page list
-   page detail
-   update
-   publish/unpublish
-   media

## Settings

-   read
-   update

## Media

-   upload
-   metadata
-   delete
-   replace

## Translations

-   read
-   update/generate where applicable

------------------------------------------------------------------------

# 46. API ERROR CONTRACT

Admin must correctly handle:

-   400
-   401
-   403
-   404
-   409
-   422
-   429
-   500
-   timeout
-   network failure

Do not show raw stack traces.

Do not leave an operation permanently loading.

Do not claim success if the request failed.

------------------------------------------------------------------------

# 47. FORM VALIDATION

Validation exists at two levels:

### Frontend

Fast user feedback.

### Backend

Security/data integrity.

Validate:

-   required fields
-   character lengths
-   URL format
-   dates
-   amount fields
-   slug uniqueness
-   media types
-   media size
-   status transitions
-   required publication fields

------------------------------------------------------------------------

# 48. SLUGS

For content with public detail URLs:

-   slug must be valid
-   slug should be unique
-   slug generation should be predictable
-   manual editing should be possible where appropriate

If an existing published slug changes, avoid accidentally creating
broken links.

If the project has redirects/history support, preserve old routes.

------------------------------------------------------------------------

# 49. PREVIEW

Preview is mandatory for:

-   Campaign
-   Initiative
-   Gallery item where meaningful
-   Blog
-   Content pages
-   Social content where meaningful

Preview must not accidentally publish content.

Prefer using the actual public renderer with preview/draft data where
architecture allows.

------------------------------------------------------------------------

# 50. DRAFTS

Draft content must not be exposed by normal public APIs.

Test directly:

-   draft created
-   public listing
-   public detail URL
-   search
-   related content

Draft must remain invisible publicly.

------------------------------------------------------------------------

# 51. PUBLISH / UNPUBLISH

Publishing must be explicit.

After publish:

-   API state changes
-   public listing updates
-   public detail updates
-   cache is revalidated if required

After unpublish:

-   public listing removes item
-   public detail becomes unavailable/appropriate fallback
-   no broken related content

------------------------------------------------------------------------

# 52. CACHE / REVALIDATION

Inspect whether the public app uses:

-   SSR
-   SSG
-   ISR
-   server fetching
-   client fetching
-   browser cache
-   custom caching

Admin updates must invalidate/revalidate the relevant public data.

Do not accept a system where:

> Admin says Published but public website still shows old content
> indefinitely.

Use the framework's existing cache/revalidation mechanisms where
possible.

------------------------------------------------------------------------

# 53. LOADING STATES

Every async operation must have an intentional state:

-   list loading
-   form loading
-   save loading
-   upload loading
-   delete loading
-   publish loading
-   unpublish loading
-   preview loading
-   translation loading

Disable duplicate submissions.

------------------------------------------------------------------------

# 54. EMPTY STATES

Admin collections need useful empty states.

Examples:

"No campaigns yet."

"Create your first campaign."

"No initiatives yet."

"No gallery items yet."

"No blog posts yet."

"No Instagram posts yet."

"No YouTube videos yet."

Public pages also need correct empty states.

------------------------------------------------------------------------

# 55. DELETE CONFIRMATIONS

Any destructive action must require confirmation.

The confirmation should identify the content being deleted.

Do not delete immediately on a single accidental click.

------------------------------------------------------------------------

# 56. UNSAVED CHANGES

For long forms, detect unsaved changes.

If the user tries to leave:

-   warn that changes may be lost
-   allow stay
-   allow leave

Do not introduce this for trivial forms where it adds more complexity
than value.

------------------------------------------------------------------------

# 57. SEARCH / FILTER / SORT

Implement useful controls for collection pages.

Campaigns:

-   search
-   status
-   category
-   featured

Initiatives:

-   search
-   status
-   date/category

Gallery:

-   search
-   category
-   status

Blog:

-   search
-   status
-   category
-   date

Social:

-   platform
-   status

Seva:

-   search
-   category
-   status

Do not add meaningless filters.

------------------------------------------------------------------------

# 58. REORDERING

Where public order matters, Admin must control it.

Potentially:

-   campaigns
-   initiatives
-   gallery
-   blog
-   Seva
-   Instagram
-   YouTube
-   homepage featured content

Persist order in the data layer.

Do not rely on accidental insertion order.

------------------------------------------------------------------------

# 59. SECURITY AUDIT

Check:

-   route protection
-   API authorization
-   role checks
-   session expiry
-   upload validation
-   XSS
-   unsafe HTML
-   unsafe external URLs
-   secret exposure
-   API key exposure
-   client-side-only authorization
-   sensitive logs

Do not store secrets in frontend code.

------------------------------------------------------------------------

# 60. ACCESSIBILITY

Audit:

-   form labels
-   keyboard access
-   focus
-   dialogs
-   buttons
-   image alt text
-   error messages
-   upload controls
-   color contrast

Do not make Admin dependent on mouse-only interaction.

------------------------------------------------------------------------

# 61. RESPONSIVE ADMIN

Test at:

-   desktop
-   laptop
-   tablet
-   mobile

Ensure:

-   tables don't become unusable
-   dialogs fit
-   forms fit
-   media previews fit
-   navigation remains usable

Do not damage the public responsive design while implementing Admin.

------------------------------------------------------------------------

# 62. PUBLIC DESIGN PRESERVATION

The public website already has a visual direction.

Do not redesign it merely because Admin work is being done.

Preserve:

-   typography
-   spacing
-   branding
-   navigation
-   public layout
-   existing visual hierarchy

Only change public UI when necessary to support the correct dynamic data
behavior.

------------------------------------------------------------------------

# 63. NO MOCK DATA IN PRODUCTION FLOWS

Search for:

-   mockCampaign
-   dummyCampaign
-   sampleCampaign
-   fakeEvents
-   fakeGallery
-   sampleBlog
-   dummyBlog
-   placeholderSocial
-   hardcoded arrays
-   fake API responses

Mocks can exist in tests/dev tooling.

They must not silently power production Admin/public flows.

------------------------------------------------------------------------

# 64. NO FAKE CRUD

These are NOT acceptable:

-   button changes local state only
-   toast says "Saved" without persistence
-   delete removes item only from screen
-   publish changes badge only
-   upload displays preview but doesn't save reference
-   edit updates local state but not API
-   public page uses different hardcoded data

Every operation must go through the intended data layer.

------------------------------------------------------------------------

# 65. DASHBOARD

Existing:

`/admin`

Audit.

Dashboard should use real data.

Potential cards:

-   total campaigns
-   published campaigns
-   drafts
-   initiatives
-   gallery items
-   blog posts
-   donations
-   recurring donors
-   people
-   social items

Do not display fake numbers after real data is available.

Useful recent activity may come from Audit Logs.

------------------------------------------------------------------------

# 66. AUDIT LOGGING

Admin actions should be traceable where supported.

Do not make audit logs a cosmetic page.

Verify that real actions generate real entries if the backend supports
it.

------------------------------------------------------------------------

# 67. PUBLIC DATA CONSISTENCY

Avoid multiple copies of the same content.

Bad:

Campaign title stored in:

-   campaign DB
-   homepage JSON
-   card constant
-   public page constant
-   Admin constant

Good:

Campaign DB

→ API

→ public components

If homepage needs a featured campaign, store a reference rather than
duplicating the campaign content.

------------------------------------------------------------------------

# 68. RELATED CONTENT

Where entities relate:

-   campaign ↔ gallery
-   campaign ↔ initiative
-   Seva ↔ gallery
-   blog ↔ gallery
-   initiative ↔ gallery

Use stable IDs/references.

Do not depend on title text for relationships.

Do not break relationships when titles change.

------------------------------------------------------------------------

# 69. IMAGE ALT TEXT

Where meaningful, Admin should be able to specify alt text.

Public image rendering must use it.

Decorative images may use appropriate empty alt behavior.

Do not blindly use the filename as alt text.

------------------------------------------------------------------------

# 70. SEO

For dynamic detail pages, support:

-   title
-   description
-   canonical
-   OG title
-   OG description
-   OG image

Where SEO fields are absent, generate safe defaults from content.

Do not generate broken metadata.

------------------------------------------------------------------------

# 71. TESTING STRATEGY

Testing must happen at multiple levels.

## Static checks

-   TypeScript
-   lint
-   build

## Component tests

Where existing test infrastructure exists.

## Integration tests

API/data layer interactions.

## Browser/end-to-end

Actual Admin workflow.

------------------------------------------------------------------------

# 72. REQUIRED END-TO-END TEST MATRIX

  ------------------------------------------------------------------------------------------------------------
  Module         Create    Edit   Preview   Publish   Unpublish   Delete             Media    Reorder   Public
                                                                                                          Sync
  ------------ -------- ------- --------- --------- ----------- -------- ----------------- ---------- --------
  Campaign            ✓       ✓         ✓         ✓           ✓        ✓                 ✓          ✓        ✓

  Initiative          ✓       ✓         ✓         ✓           ✓        ✓                 ✓          ✓        ✓

  Gallery             ✓       ✓         ✓         ✓           ✓        ✓                 ✓          ✓        ✓

  Blog                ✓       ✓         ✓         ✓           ✓        ✓                 ✓   optional        ✓

  Seva                ✓       ✓         ✓         ✓           ✓        ✓                 ✓          ✓        ✓

  Instagram           ✓       ✓         ✓         ✓           ✓        ✓   media/reference          ✓        ✓

  YouTube             ✓       ✓         ✓         ✓           ✓        ✓         thumbnail          ✓        ✓

  Content             ✓       ✓         ✓         ✓           ✓        ✓                 ✓   optional        ✓
  ------------------------------------------------------------------------------------------------------------

If a cell is not applicable, document why.

------------------------------------------------------------------------

# 73. CAMPAIGN TEST

Test:

1.  Login.
2.  Open Campaigns.
3.  Create.
4.  Enter all required fields.
5.  Upload cover.
6.  Upload 3+ gallery images.
7.  Add video.
8.  Save draft.
9.  Preview.
10. Verify preview.
11. Publish.
12. Verify public listing.
13. Verify detail.
14. Verify cover.
15. Verify gallery.
16. Verify video.
17. Edit.
18. Verify public update.
19. Unpublish.
20. Verify public removal.
21. Republish.
22. Delete/archive.
23. Verify no broken content.

------------------------------------------------------------------------

# 74. INITIATIVE TEST

Test:

1.  Create.
2.  Add title.
3.  Add description.
4.  Add date.
5.  Add location.
6.  Add cover.
7.  Add media.
8.  Save draft.
9.  Preview.
10. Publish.
11. Verify `/events`.
12. Edit.
13. Verify update.
14. Unpublish.
15. Verify removal.
16. Republish.
17. Delete/archive.
18. Verify no broken references.

------------------------------------------------------------------------

# 75. GALLERY TEST

Test:

1.  Add image.
2.  Select Initiatives.
3.  Save draft.
4.  Preview.
5.  Publish.
6.  Verify All.
7.  Verify Initiatives.
8.  Add Seva item.
9.  Verify Seva filter.
10. Edit caption.
11. Verify update.
12. Reorder.
13. Verify order.
14. Unpublish.
15. Verify removal.
16. Delete.
17. Verify removal.

Repeat enough categories to verify filtering logic.

------------------------------------------------------------------------

# 76. BLOG TEST

Test:

1.  Create.
2.  Add title.
3.  Add excerpt.
4.  Add rich content.
5.  Add cover.
6.  Add author.
7.  Add category.
8.  Save draft.
9.  Verify not public.
10. Preview.
11. Publish.
12. Verify `/blog`.
13. Open detail.
14. Edit.
15. Verify update.
16. Unpublish.
17. Verify removal.
18. Republish.
19. Delete/archive.
20. Verify no broken route.

------------------------------------------------------------------------

# 77. SOCIAL TEST

Instagram:

1.  Add.
2.  Publish.
3.  Verify public section.
4.  Edit.
5.  Verify.
6.  Unpublish.
7.  Verify section behavior.
8.  Delete.

YouTube:

Repeat.

Finally:

-   zero Instagram → section hidden
-   zero YouTube → section hidden

------------------------------------------------------------------------

# 78. CONTENT PAGE TEST

For every CMS-managed static page:

1.  Open Admin.
2.  Edit.
3.  Save.
4.  Preview.
5.  Publish.
6.  Open public page.
7.  Verify.
8.  Edit.
9.  Verify update.
10. Unpublish only if the page's architecture allows it safely.
11. Verify behavior.

------------------------------------------------------------------------

# 79. FAILURE TESTS

Intentionally test:

-   invalid image
-   oversized image
-   invalid URL
-   empty title
-   duplicate slug
-   failed API request
-   401
-   403
-   404
-   409
-   422
-   500
-   network disconnect
-   timeout
-   failed upload
-   delete failure
-   publish failure
-   session expiry

Expected:

-   no crash
-   useful error
-   no false success
-   no permanent spinner
-   no corrupted form state

------------------------------------------------------------------------

# 80. REFRESH TEST

Refresh after:

-   create
-   edit
-   upload
-   reorder
-   publish
-   unpublish

The persisted state must remain correct.

Test both Admin and Public.

------------------------------------------------------------------------

# 81. DIRECT URL TEST

Test:

### Logged out

Directly open Admin URL.

Expected:

-   login/protection.

### Authorized

Direct URL works.

### Unauthorized

Access denied.

Do not rely on hiding navigation links.

------------------------------------------------------------------------

# 82. BROWSER CONSOLE AUDIT

At final stage:

Open public pages.

Open Admin pages.

Check browser console.

There must be no unexplained:

-   errors
-   warnings
-   hydration errors
-   failed assets
-   failed requests
-   missing keys
-   React errors

Fix root causes.

Do not silence warnings merely to achieve a clean console.

------------------------------------------------------------------------

# 83. NETWORK AUDIT

Inspect browser network activity.

Look for:

-   duplicate requests
-   infinite requests
-   failed API calls
-   wrong HTTP methods
-   missing authentication
-   incorrect payload
-   unexpected 404
-   stale data

Fix real problems.

------------------------------------------------------------------------

# 84. BUILD AUDIT

Run the project's real scripts.

At minimum, where available:

-   install/dependency check
-   typecheck
-   lint
-   tests
-   production build

Fix every failure.

Do not leave known failing checks.

------------------------------------------------------------------------

# 85. DEPENDENCY DISCIPLINE

Do not add packages casually.

Before adding a package:

1.  Check whether an existing dependency already solves it.
2.  Prefer project conventions.
3.  Add only if necessary.
4.  Verify build compatibility.

------------------------------------------------------------------------

# 86. DATABASE/API COMPATIBILITY

Do not invent backend schema assumptions silently.

If the backend schema is present:

-   use it.

If backend schema is incomplete:

-   define the frontend contract clearly.

If API is pending:

-   isolate adapter/interface.

The final API integration should require minimal frontend rewrite.

------------------------------------------------------------------------

# 87. DATA NULLABILITY

Treat nullable fields correctly.

Do not assume:

-   image always exists
-   video always exists
-   description always exists
-   category always exists
-   translation always exists

Public rendering must handle absent optional data safely.

------------------------------------------------------------------------

# 88. SECURITY OF RICH CONTENT

If Blog/Content supports rich HTML:

-   sanitize unsafe HTML
-   reject scripts
-   reject dangerous attributes
-   prevent stored XSS

Do not directly inject unsanitized Admin content into the DOM.

------------------------------------------------------------------------

# 89. EXTERNAL LINKS

Validate/handle external links.

For:

-   Instagram
-   YouTube
-   registration
-   donation
-   social media
-   maps

Do not allow malformed or dangerous URLs.

------------------------------------------------------------------------

# 90. IMAGE HANDLING

Avoid layout shift and broken image UI.

Provide:

-   dimensions where possible
-   loading behavior
-   fallback
-   alt text
-   broken-image handling

Do not allow an invalid media record to break an entire page.

------------------------------------------------------------------------

# 91. PUBLIC PERFORMANCE

Do not turn every public component into an unnecessarily heavy client
component.

Prefer existing rendering architecture.

Do not fetch the same content repeatedly if one appropriate request can
provide it.

Do not load full-resolution galleries when thumbnails are sufficient for
listing pages.

------------------------------------------------------------------------

# 92. ADMIN PERFORMANCE

For large collections:

-   pagination
-   debounced search
-   reasonable filtering
-   avoid fetching thousands of records unnecessarily

Do not over-engineer if the expected dataset is small.

------------------------------------------------------------------------

# 93. RESPONSIVE PUBLIC REGRESSION

After CMS changes, test public pages on:

-   desktop
-   tablet
-   mobile

Especially:

-   Campaign cards
-   Gallery grid
-   Blog cards
-   Initiative cards
-   media galleries
-   social sections

Admin changes must not break public layouts.

------------------------------------------------------------------------

# 94. ACCESSIBILITY REGRESSION

Test public content after dynamic rendering:

-   headings
-   images
-   links
-   buttons
-   focus
-   alt text
-   keyboard navigation

Dynamic CMS content must be as accessible as static content.

------------------------------------------------------------------------

# 95. FINAL HARDENING PASS

After all functionality is implemented:

Search repository for:

-   TODO
-   FIXME
-   mock
-   dummy
-   placeholder
-   temporary
-   hardcoded dynamic data
-   fake API
-   fake success
-   `console.log`
-   dead code
-   unused imports
-   unreachable routes
-   broken links

Review each result.

------------------------------------------------------------------------

# 96. FINAL PUBLIC/ADMIN FEATURE MATRIX

Before declaring complete, maintain an internal matrix:

  -----------------------------------------------------------------------------------------------------------------------------
  Public Feature Public Route   Admin Module       CRUD   Preview   Publish   Media      Translation   API    Public   Tested
                                                                                                              Sync     
  -------------- -------------- ------------------ ------ --------- --------- ---------- ------------- ------ -------- --------
  Campaigns      `/campaigns`   Campaigns          ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Initiatives    `/events`      Initiatives        ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Gallery        `/gallery`     Gallery            ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Blog           `/blog`        Blog               ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Seva           public Seva    Seva Areas         ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓
                 routes                                                                                                

  Instagram      homepage       Social             ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  YouTube        homepage       Social             ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  About          Our Story      Content            ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Transparency   Transparency   Content            ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Volunteer      Volunteer      Content            ✓      ✓         ✓         ✓          ✓             ✓      ✓        ✓

  Contact        Contact        Content/Settings   ✓      ✓         ✓         optional   ✓             ✓      ✓        ✓

  Legal          Legal pages    Content            ✓      ✓         ✓         optional   ✓             ✓      ✓        ✓
  -----------------------------------------------------------------------------------------------------------------------------

Adjust the matrix to the actual repository.

------------------------------------------------------------------------

# 97. ACCEPTANCE CRITERIA

The system is accepted only when:

## Admin

-   Existing Admin routes work.
-   New collection routes work.
-   CRUD works.
-   Preview works.
-   Publish works.
-   Unpublish works.
-   Delete/archive works.
-   Media works.
-   Validation works.
-   Error states work.
-   Loading states work.
-   Authorization works.

## Public

-   Public pages remain visually correct.
-   Dynamic content comes from the correct source.
-   Admin changes propagate.
-   Drafts are hidden.
-   Unpublished content is hidden.
-   Published content appears.
-   Empty states work.
-   Media works.
-   Categories work.
-   Translation fallback works.
-   SEO works where applicable.

## Engineering

-   No known runtime errors.
-   No known build errors.
-   No known TypeScript errors.
-   No broken imports.
-   No fake production data.
-   No unexplained network failures.
-   No known broken CRUD.
-   No known Admin/public mismatch.

------------------------------------------------------------------------

# 98. IMPORTANT: DO NOT STOP AFTER IMPLEMENTING THE OBVIOUS EXAMPLES

The user explicitly mentioned:

-   campaign photo/video
-   campaign cover
-   missing Admin functionality
-   Admin/public connectivity

These are examples, not the complete task.

The agent must continue auditing for:

-   missing entities
-   missing fields
-   missing CRUD
-   missing media
-   missing preview
-   missing publication controls
-   missing relationships
-   missing translation
-   missing SEO
-   missing API connection
-   stale public data
-   hardcoded public content
-   broken empty states
-   broken responsive states
-   broken error states

The agent is expected to discover and fix these independently.

------------------------------------------------------------------------

# 99. REQUIRED IMPLEMENTATION ORDER

Use this order unless repository constraints require a documented
deviation.

## Phase 1 --- Discovery

-   repository audit
-   public route audit
-   Admin route audit
-   data model audit
-   API audit
-   media audit
-   i18n audit
-   hardcoded data audit

## Phase 2 --- Shared infrastructure

-   API client
-   shared types
-   error handling
-   validation
-   media utilities
-   notifications
-   dialogs
-   publication state handling
-   preview mechanism

## Phase 3 --- P0 CMS

1.  Campaigns
2.  Initiatives
3.  Gallery
4.  Blog
5.  Seva

## Phase 4 --- P1 content

6.  Homepage
7.  About
8.  Transparency
9.  Volunteer
10. Contact
11. Legal

## Phase 5 --- Social

12. Instagram
13. YouTube

## Phase 6 --- Operations

14. People
15. Donations
16. Monthly Giving
17. Audit Logs
18. Settings

## Phase 7 --- Cross-cutting

19. i18n
20. SEO
21. cache/revalidation
22. security
23. accessibility
24. responsive QA

## Phase 8 --- Testing

25. typecheck
26. lint
27. unit/integration tests
28. browser tests
29. full CRUD tests
30. public synchronization tests
31. regression
32. final repository audit

------------------------------------------------------------------------

# 100. IF TIME IS LIMITED

Do NOT stop halfway through a CMS module.

A smaller number of fully working modules is preferable to many
half-built modules.

Priority:

### P0

-   Campaigns
-   Initiatives
-   Gallery
-   Blog
-   Seva

### P1

-   Homepage
-   Content pages
-   Instagram
-   YouTube
-   Media
-   Translation
-   Preview/publishing infrastructure

### P2

-   operational dashboards
-   advanced filtering
-   convenience features

But do not remove existing required Admin functionality merely because
it is P2.

------------------------------------------------------------------------

# 101. FINAL REPORT TO USER

When work is finished, produce a report containing:

## 1. Completed modules

List every module implemented/fixed.

## 2. Existing features verified

List features that already existed and were tested rather than rebuilt.

## 3. New routes

List Admin routes added.

## 4. Public/Admin mapping

Show which Admin module controls which public page.

## 5. API contract

List required endpoints and payloads.

## 6. Media

Explain image/video handling.

## 7. Translation

Explain i18n behavior.

## 8. Testing

List actual tests run.

## 9. Build checks

List:

-   typecheck
-   lint
-   test
-   build

with results.

## 10. Bugs fixed

List important bugs found.

## 11. Remaining API work

Only list the actual external/backend work still required.

## 12. Known issues

If any known issue remains, state it explicitly.

Do not say "complete" while known production-breaking issues remain.

------------------------------------------------------------------------

# 102. FINAL AGENT COMMAND

Work independently through the repository.

Do not wait for the user to identify every missing feature.

Do not assume an existing screen is correct merely because it renders.

For every feature:

**INSPECT → VERIFY → KEEP / REPAIR / IMPLEMENT → CONNECT → TEST →
REGRESSION TEST**

The objective is not to make the Admin UI look complete.

The objective is to make the website a real CMS-controlled product.

The desired client workflow is:

> Login to Admin\
> → create/edit content\
> → upload media\
> → save draft\
> → preview\
> → publish\
> → open public website\
> → verify correct content\
> → edit again\
> → verify update\
> → unpublish\
> → verify removal\
> → republish\
> → verify restoration

This workflow must work reliably for all applicable content types.

------------------------------------------------------------------------

# 103. NON-NEGOTIABLE QUALITY BAR

Do not leave:

-   fake buttons
-   dead buttons
-   disconnected forms
-   fake CRUD
-   fake success messages
-   fake uploads
-   hardcoded dynamic content
-   broken media
-   broken filters
-   broken categories
-   broken previews
-   broken publication states
-   stale public content
-   unhandled API errors
-   infinite loading
-   console errors
-   build errors
-   TypeScript errors
-   obvious security problems
-   broken mobile Admin
-   broken public pages

The goal is:

**ZERO KNOWN BUGS / ZERO KNOWN ERRORS at the end of the implementation
pass.**

If an external API prevents final integration, isolate that dependency
and test everything that can be tested without it.

Do not hide incomplete work.

------------------------------------------------------------------------

# 104. FINAL CHECKLIST

Before stopping, answer YES to all applicable questions:

-   [ ] Repository fully audited
-   [ ] Public routes audited
-   [ ] Admin routes audited
-   [ ] Campaign CMS complete
-   [ ] Campaign cover upload works
-   [ ] Campaign gallery works
-   [ ] Campaign video works
-   [ ] Initiative CMS complete
-   [ ] Gallery CMS complete
-   [ ] Gallery categories work
-   [ ] Blog CMS complete
-   [ ] Seva CMS complete
-   [ ] Content pages audited
-   [ ] Homepage dynamic content audited
-   [ ] Instagram CMS complete
-   [ ] YouTube CMS complete
-   [ ] People audited
-   [ ] Donations audited
-   [ ] Monthly Giving audited
-   [ ] Audit Logs audited
-   [ ] Settings audited
-   [ ] Shared media audited
-   [ ] i18n audited
-   [ ] Preview works
-   [ ] Draft works
-   [ ] Publish works
-   [ ] Unpublish works
-   [ ] Delete/archive works
-   [ ] Reorder works where required
-   [ ] Search/filter works where required
-   [ ] API boundaries are clean
-   [ ] Hardcoded dynamic content removed
-   [ ] Loading states implemented
-   [ ] Error states implemented
-   [ ] Empty states implemented
-   [ ] Authorization tested
-   [ ] Security audit performed
-   [ ] Accessibility audit performed
-   [ ] Responsive Admin tested
-   [ ] Public regression tested
-   [ ] Browser console clean
-   [ ] Network errors resolved
-   [ ] Typecheck passes
-   [ ] Lint passes
-   [ ] Tests pass
-   [ ] Production build passes
-   [ ] Full Admin → Public workflows tested
-   [ ] Final repository audit completed
-   [ ] No known production-breaking bugs remain

------------------------------------------------------------------------

## END OF IMPLEMENTATION SPECIFICATION
