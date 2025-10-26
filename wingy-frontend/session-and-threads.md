# TASK: Implement User Session Persistence and Multi-Thread Chat System

## OBJECTIVE
Build a complete session management and multi-thread chat system for Wingy gaming assistant. Users should complete onboarding once, maintain persistent sessions across page refreshes, and manage multiple chat conversations.

---

## PROBLEM STATEMENT

**Current Issues:**
1. Every page refresh returns to onboarding screen
2. User preferences are not persisted
3. No conversation history persistence
4. Cannot create multiple chat threads
5. No way to switch between different conversations

**Required Solution:**
1. One-time onboarding with persistent preferences
2. Session survives page refreshes and browser restarts
3. Multiple independent chat threads per user
4. Sidebar navigation for thread management
5. Settings page for preference updates

---

## ARCHITECTURE REQUIREMENTS

### Backend (FastAPI + SQLite)

**Database Schema:**
Create three main tables:
1. `users` - Store user identity and preferences
2. `threads` - Store chat conversations (rename from current `sessions` table if exists)
3. `messages` - Store individual messages within threads

**API Endpoints Needed:**

User Management:
- `POST /users/create` - Generate new user_id
- `POST /users/{user_id}/onboard` - Save initial preferences
- `GET /users/{user_id}/preferences` - Retrieve user preferences
- `PUT /users/{user_id}/preferences` - Update preferences

Thread Management:
- `POST /threads/create` - Create new chat thread
- `GET /threads/user/{user_id}` - List all user's threads
- `GET /threads/{thread_id}/messages` - Get thread's message history
- `DELETE /threads/{thread_id}` - Delete thread
- `PUT /threads/{thread_id}/title` - Rename thread

Message Operations:
- `POST /threads/{thread_id}/messages` - Add new message
- Keep existing chat endpoint integration

**Requirements:**
- Use existing SQLite database connection
- Follow existing FastAPI route patterns in codebase
- Use Pydantic models for request/response validation
- Include proper error handling (404, 400, 500)
- Add database migrations if needed
- Ensure thread_id and user_id are UUIDs
- Add foreign key constraints

---

### Frontend (React + TypeScript)

**State Management Architecture:**

Use React Context API (no Redux/Zustand for MVP):
1. UserContext - Manages user identity and preferences
2. ThreadContext - Manages active threads and messages
3. Wrap entire app in both providers

**Data Persistence Strategy:**

localStorage (minimal):
- `wingy_user_id` - User identifier only
- `wingy_active_thread` - Last active thread ID

Backend API (everything else):
- User preferences
- All threads
- All messages
- Conversation history

**Component Structure:**

Create new components:
1. Sidebar with thread list and "New Chat" button
2. Thread list showing all conversations
3. Individual thread item (with hover actions)
4. Settings modal/page for preference editing
5. App layout combining sidebar + chat
6. Empty state when no threads exist

Update existing components:
- App.tsx - Add routing logic based on onboarding status
- Chat interface - Connect to active thread context
- Message components - Load from thread history

**Required Hooks:**

Create custom hooks:
- `useUser()` - Access user context
- `useThreads()` - Access thread context
- `useMessages()` - Access message operations

**API Integration:**

Create API utility functions in `src/lib/api/`:
- `user.ts` - User-related API calls
- `threads.ts` - Thread CRUD operations
- `messages.ts` - Message operations

Follow patterns:
- Use `fetch` or `axios` consistently with existing code
- Add proper TypeScript types for all requests/responses
- Include loading states
- Handle errors gracefully with user feedback
- Use environment variables for API base URL

---

## USER FLOW SPECIFICATIONS

### First-Time User Journey:
1. App loads, no user_id in localStorage
2. Call API to create new user
3. Store user_id in localStorage
4. Show onboarding flow (game selection + preferences)
5. Submit preferences to API
6. Transition to main app (sidebar + empty chat state)
7. Prompt user to start first chat

### Returning User Journey:
1. App loads, user_id found in localStorage
2. Fetch user preferences from API
3. Fetch all threads for user
4. Show main app with sidebar populated
5. Auto-load last active thread or most recent
6. Display thread's message history

### New Chat Thread:
1. User clicks "New Chat" button
2. API creates new thread
3. Add thread to sidebar
4. Switch to new empty chat
5. Generate auto-title after first message (e.g., "Chat - Oct 24, 3:45 PM")

### Switching Threads:
1. User clicks thread in sidebar
2. Save current thread_id to localStorage
3. Load selected thread's messages
4. Update UI with thread history
5. Scroll to latest message

### Deleting Threads:
1. User clicks delete on thread item
2. Show confirmation dialog
3. Call delete API
4. Remove from sidebar
5. If was active thread, clear chat or load another thread

### Updating Preferences:
1. User opens settings (gear icon in sidebar)
2. Show current preferences
3. Allow editing game selection and assistant mode
4. Save changes to API
5. Update context state
6. Close settings modal

---

## TECHNICAL REQUIREMENTS

**TypeScript:**
- Create proper interfaces for User, Thread, Message, Preferences
- Store types in `src/types/` directory
- Use strict typing for all API functions
- No `any` types except where absolutely necessary

**Error Handling:**
- Wrap API calls in try-catch
- Show user-friendly error messages (toast/alert)
- Handle network failures gracefully
- Log errors to console for debugging

**Performance:**
- Don't fetch thread list on every render
- Cache thread data in context
- Only refetch when creating/deleting threads
- Use React.memo for thread list items
- Implement optimistic UI updates for messages

**Styling:**
- Match existing dark theme (purple accent)
- Use Tailwind CSS exclusively
- Sidebar width: 256px (w-64)
- Responsive: collapse sidebar on mobile, show hamburger menu
- Smooth transitions for all interactions

**Accessibility:**
- Keyboard navigation for thread list
- Focus management when switching threads
- ARIA labels for icon buttons
- Screen reader announcements for thread changes

---

## IMPLEMENTATION STRATEGY

**Approach:**
Build incrementally and test each phase before moving to next.

**Phase 1: Backend Foundation**
1. Design database schema
2. Create migration script if needed
3. Implement user management endpoints
4. Implement thread management endpoints
5. Test all endpoints with curl/Postman

**Phase 2: Frontend State**
1. Create TypeScript types
2. Build UserContext with localStorage integration
3. Build ThreadContext with API integration
4. Create custom hooks
5. Test context providers in isolation

**Phase 3: UI Components**
1. Build sidebar layout
2. Create thread list component
3. Add new thread button
4. Build settings modal
5. Update App.tsx routing
6. Connect chat interface to thread context

**Phase 4: Integration**
1. Wire everything together
2. Test full user journeys
3. Handle edge cases (no threads, deleted threads, etc.)
4. Add loading states everywhere
5. Polish UX with animations

**Phase 5: Testing & Polish**
1. Test with real backend
2. Verify persistence across refreshes
3. Test multi-thread switching
4. Check mobile responsiveness
5. Fix any bugs

---

## EDGE CASES TO HANDLE

**User Management:**
- User_id exists but backend has no record (data deleted) → Create new user
- Onboarding incomplete but user_id exists → Resume onboarding
- API fails during user creation → Retry with exponential backoff

**Thread Management:**
- No threads exist → Show empty state with "Start your first chat"
- Active thread deleted → Switch to most recent or show empty state
- Loading thread fails → Show error message, allow retry
- Thread list empty after deleting last thread → Prompt to create new

**Message Operations:**
- Sending message while offline → Queue and retry when online
- Duplicate messages → Prevent with request deduplication
- Message send fails → Show retry button, keep in UI with error indicator

**State Synchronization:**
- localStorage user_id mismatch with context → Use localStorage as source of truth
- Backend preferences differ from context → Backend is source of truth, update context

---

## SUCCESS CRITERIA

**Functional Requirements:**
- [ ] First-time users see onboarding exactly once
- [ ] Returning users go directly to chat
- [ ] Page refresh maintains user session
- [ ] Can create unlimited chat threads
- [ ] Can switch between threads seamlessly
- [ ] Can delete threads with confirmation
- [ ] Can update preferences from settings
- [ ] All data persists across browser restarts

**Technical Requirements:**
- [ ] Zero TypeScript errors
- [ ] Zero console errors/warnings
- [ ] All API calls have loading states
- [ ] All errors display user-friendly messages
- [ ] Mobile responsive (sidebar collapses)
- [ ] Follows existing code patterns
- [ ] Proper Git commits for each phase

**User Experience:**
- [ ] Smooth transitions between screens
- [ ] Clear visual feedback for all actions
- [ ] Intuitive sidebar navigation
- [ ] Professional appearance matching brand
- [ ] Fast load times (<1s for thread switch)

---

## CONSTRAINTS & GUIDELINES

**Do:**
- Follow existing project structure and conventions
- Use functional React components (no class components)
- Use async/await for all API calls
- Implement proper loading states
- Add meaningful Git commit messages
- Test each feature before moving to next

**Don't:**
- Introduce new state management libraries (use Context API)
- Add new CSS frameworks (use Tailwind only)
- Hardcode API URLs (use environment variables)
- Skip error handling
- Create components without TypeScript types
- Mix localStorage and backend as source of truth

**Code Quality:**
- Write clean, readable code with comments
- Extract reusable logic into hooks
- Keep components under 200 lines
- Name variables descriptively
- Follow React best practices
- Use proper semantic HTML

---

## REFERENCE CONTEXT

**Current Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, SQLite, Pydantic
- Already implemented: Basic chat, onboarding UI, markdown rendering
- Backend path: `src/wingy/`
- Frontend path: `frontend/src/`

**Existing Backend Patterns:**
Review existing route files in `src/wingy/api/routes/` to match structure.

**Existing Frontend Patterns:**
Review existing components to match styling and patterns.

---

## DELIVERABLES

**Backend Files to Create:**
- User management route file
- Thread management route file
- Database migration script (if schema changes needed)
- Updated Pydantic models

**Frontend Files to Create:**
- UserContext provider
- ThreadContext provider
- User hook
- Threads hook
- API utility modules (user, threads, messages)
- TypeScript type definitions
- Sidebar component
- Thread list component
- Thread item component
- Settings modal component
- App layout component

**Files to Update:**
- App.tsx (routing logic)
- Main chat interface (connect to thread context)
- Environment variable files

**Documentation:**
- Update README with new features
- Add API endpoint documentation
- Document state management architecture

---

## VALIDATION CHECKLIST

Before considering this task complete, verify:

**Manual Testing:**
- [ ] Clear localStorage and cookies
- [ ] Visit app → Complete onboarding
- [ ] Refresh page → Still logged in
- [ ] Create 3 chat threads
- [ ] Send messages in each thread
- [ ] Switch between threads → Correct messages show
- [ ] Delete middle thread → Sidebar updates
- [ ] Update preferences in settings → Saved on refresh
- [ ] Close browser completely → Reopen → Still logged in

**Code Quality:**
- [ ] Run TypeScript compiler → 0 errors
- [ ] Run linter → 0 warnings
- [ ] Check bundle size → Reasonable increase
- [ ] Review code → No console.logs left
- [ ] All TODOs resolved or documented

**User Experience:**
- [ ] All buttons respond immediately
- [ ] Loading indicators show during API calls
- [ ] Error messages are helpful
- [ ] Animations are smooth (60fps)
- [ ] No layout shift during loads

---

## NOTES FOR IMPLEMENTATION

**Start Simple:**
Begin with basic thread management, then add complexity.

**Test Incrementally:**
Don't build everything at once. Test each piece.

**Use Copilot:**
Let Copilot generate boilerplate, but review and understand all code.

**Ask Questions:**
If architecture unclear, check existing patterns or ask for clarification.

**Document Decisions:**
Add comments explaining non-obvious code.

**Think Long-Term:**
Build with future features in mind (sharing threads, multi-user, etc.)

---

REMEMBER: This is production code for a portfolio project. Quality over speed. Make it maintainable, testable, and scalable.
