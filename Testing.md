# VirtualBoard AI — Comprehensive Functional Testing

You are a QA Engineer. Perform a complete functional test of the VirtualBoard AI application. Test every feature, document results, and fix any issues found.

## Test Environment Setup

### Prerequisites Check
```bash
# Verify environment
npm run dev

# Check environment variables are set
echo "Checking .env.local..."
```

Confirm:
- [ ] Dev server running on localhost:3000
- [ ] Supabase connection working
- [ ] OpenAI API key configured

---

## Test Suite 1: Authentication Flow

### Test 1.1: User Registration
```
Route: /signup
Actions:
1. Navigate to /signup
2. Enter test email: test-[timestamp]@example.com
3. Enter password: TestPass123!
4. Click "Sign Up" button

Expected Results:
- [ ] Form validates inputs
- [ ] Success message or redirect to dashboard
- [ ] User created in Supabase Auth
- [ ] Profile created in profiles table

Actual Result: [PASS/FAIL]
Notes:
```

### Test 1.2: User Login
```
Route: /login
Actions:
1. Navigate to /login
2. Enter valid credentials
3. Click "Login" button

Expected Results:
- [ ] Form validates inputs
- [ ] Redirect to /dashboard on success
- [ ] Session cookie set
- [ ] User data accessible

Actual Result: [PASS/FAIL]
Notes:
```

### Test 1.3: Password Reset Flow
```
Route: /forgot-password → /reset-password
Actions:
1. Navigate to /forgot-password
2. Enter registered email
3. Click "Send Reset Link"
4. Check email for link
5. Click link, enter new password

Expected Results:
- [ ] Reset email sent
- [ ] Link redirects to /reset-password
- [ ] Password updates successfully
- [ ] Can login with new password

Actual Result: [PASS/FAIL]
Notes:
```

### Test 1.4: Protected Routes
```
Actions:
1. Logout completely
2. Try to access /dashboard directly
3. Try to access /dashboard/projects

Expected Results:
- [ ] Redirected to /login
- [ ] No unauthorized access
- [ ] Return URL preserved (optional)

Actual Result: [PASS/FAIL]
Notes:
```

### Test 1.5: Logout
```
Actions:
1. While logged in, click Logout
2. Try to access protected route

Expected Results:
- [ ] Session cleared
- [ ] Redirected to login or home
- [ ] Cannot access protected routes

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 2: Project Management

### Test 2.1: Create Project
```
Route: /dashboard/projects/new
Actions:
1. Navigate to /dashboard/projects/new
2. Fill in project name: "Test Project [timestamp]"
3. Fill in description
4. Select industry (if applicable)
5. Click "Create Project"

Expected Results:
- [ ] Form validates required fields
- [ ] Project created in database
- [ ] Redirect to project page
- [ ] Project appears in projects list

Actual Result: [PASS/FAIL]
Notes:
```

### Test 2.2: View Projects List
```
Route: /dashboard/projects
Actions:
1. Navigate to /dashboard/projects
2. Observe the list

Expected Results:
- [ ] All user's projects displayed
- [ ] Project cards show name, description
- [ ] Correct counts (meetings, documents)
- [ ] Links to project detail work

Actual Result: [PASS/FAIL]
Notes:
```

### Test 2.3: View Project Detail
```
Route: /dashboard/projects/[projectId]
Actions:
1. Click on a project from list
2. Observe the dashboard

Expected Results:
- [ ] Project info displayed correctly
- [ ] Statistics/metrics shown
- [ ] Navigation tabs/links work
- [ ] Quick actions available

Actual Result: [PASS/FAIL]
Notes:
```

### Test 2.4: Edit Project
```
Route: /dashboard/projects/[projectId]/settings
Actions:
1. Navigate to project settings
2. Update project name
3. Update description
4. Click "Save Changes"

Expected Results:
- [ ] Form pre-filled with current data
- [ ] Changes saved successfully
- [ ] Success message displayed
- [ ] Changes reflected immediately

Actual Result: [PASS/FAIL]
Notes:
```

### Test 2.5: Delete Project
```
Route: /dashboard/projects/[projectId]/settings
Actions:
1. Navigate to project settings
2. Click "Delete Project"
3. Confirm deletion

Expected Results:
- [ ] Confirmation dialog shown
- [ ] Project deleted from database
- [ ] Redirect to projects list
- [ ] Project no longer appears

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 3: Knowledge Base / Documents

### Test 3.1: View Knowledge Base
```
Route: /dashboard/projects/[projectId]/knowledge
Actions:
1. Navigate to project's knowledge base
2. Observe the page

Expected Results:
- [ ] Page loads without 404
- [ ] Empty state shown if no documents
- [ ] Upload button visible
- [ ] Existing documents listed (if any)

Actual Result: [PASS/FAIL]
Notes:
```

### Test 3.2: Upload Document
```
Route: /dashboard/projects/[projectId]/knowledge/upload
Actions:
1. Click "Upload Document"
2. Select a PDF file (< 5MB)
3. Wait for processing

Expected Results:
- [ ] File upload accepted
- [ ] Processing indicator shown
- [ ] Document parsed successfully
- [ ] Chunks created and embedded
- [ ] Document appears in knowledge base
- [ ] Chunk count displayed

Actual Result: [PASS/FAIL]
Notes:
```

### Test 3.3: Upload Invalid File
```
Actions:
1. Try to upload non-PDF file
2. Try to upload very large file (> limit)

Expected Results:
- [ ] Error message for invalid type
- [ ] Error message for size limit
- [ ] No partial uploads created

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 4: Meetings

### Test 4.1: Create Meeting
```
Route: /dashboard/projects/[projectId]/meetings/new
Actions:
1. Navigate to new meeting page
2. Enter meeting topic/agenda
3. Select strategy (e.g., Growth, Conservative)
4. Select agents (CFO, CTO, Legal, CMO)
5. Click "Start Meeting"

Expected Results:
- [ ] Form validates inputs
- [ ] Meeting created in database
- [ ] Redirect to meeting session
- [ ] Selected agents associated with meeting

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.2: Meeting Chat - Send Message
```
Route: /dashboard/projects/[projectId]/meetings/[meetingId]
Actions:
1. Open active meeting
2. Type a message: "What should be our Q1 priority?"
3. Press Send or Enter

Expected Results:
- [ ] Message appears in chat
- [ ] Message saved to database
- [ ] AI response starts streaming
- [ ] No 404 or HTML errors
- [ ] Multiple agent perspectives shown

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.3: Meeting Chat - AI Response Quality
```
Actions:
1. Send a strategic question
2. Observe AI response

Expected Results:
- [ ] Moderator synthesizes discussion
- [ ] Each agent provides perspective
- [ ] Response relevant to strategy weight
- [ ] RAG context used (if documents exist)
- [ ] Response is coherent and helpful

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.4: Meeting Chat - Streaming
```
Actions:
1. Send a message
2. Observe response delivery

Expected Results:
- [ ] Response streams in real-time
- [ ] No lag or freezing
- [ ] Partial content visible during stream
- [ ] Complete message when done

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.5: End Meeting
```
Actions:
1. In active meeting, click "End Meeting & Summarize"
2. Wait for processing

Expected Results:
- [ ] Confirmation dialog shown
- [ ] Meeting summary generated
- [ ] Memory/embedding stored
- [ ] Meeting status changed to COMPLETED
- [ ] PDF export available

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.6: Export Meeting PDF
```
Actions:
1. After ending meeting, click "Export PDF"
2. Download the file

Expected Results:
- [ ] PDF downloads successfully
- [ ] Contains meeting details
- [ ] Contains transcript/summary
- [ ] Contains decisions/action items
- [ ] Properly formatted

Actual Result: [PASS/FAIL]
Notes:
```

### Test 4.7: View Past Meetings
```
Route: /dashboard/projects/[projectId]/meetings
Actions:
1. Navigate to meetings list
2. Click on a completed meeting

Expected Results:
- [ ] All meetings listed
- [ ] Status indicators correct
- [ ] Can view completed meeting transcript
- [ ] Cannot send new messages in completed meeting

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 5: RAG & Context

### Test 5.1: Document Context in Chat
```
Prerequisites: Upload a document with specific content
Actions:
1. Start new meeting
2. Ask question related to document content
3. Observe AI response

Expected Results:
- [ ] AI references document content
- [ ] Response includes relevant context
- [ ] Information accurate to document

Actual Result: [PASS/FAIL]
Notes:
```

### Test 5.2: Meeting Memory
```
Prerequisites: Complete a meeting with decisions
Actions:
1. Start new meeting in same project
2. Reference previous meeting decisions
3. Ask: "What did we decide last time?"

Expected Results:
- [ ] AI recalls previous meeting context
- [ ] Memory retrieval working
- [ ] Decisions referenced correctly

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 6: Localization (EN/AR)

### Test 6.1: Language Switch
```
Actions:
1. Find language toggle (EN/AR)
2. Switch to Arabic
3. Navigate through app

Expected Results:
- [ ] UI text changes to Arabic
- [ ] RTL layout applied
- [ ] All components flip correctly
- [ ] Forms work in RTL
- [ ] No broken layouts

Actual Result: [PASS/FAIL]
Notes:
```

### Test 6.2: Language Persistence
```
Actions:
1. Set language to Arabic
2. Refresh page
3. Navigate to different pages

Expected Results:
- [ ] Language persists after refresh
- [ ] Stored in localStorage
- [ ] Consistent across pages

Actual Result: [PASS/FAIL]
Notes:
```

### Test 6.3: Arabic Content Input
```
Actions:
1. Create project with Arabic name
2. Send Arabic message in chat
3. View responses

Expected Results:
- [ ] Arabic text saved correctly
- [ ] Displayed properly
- [ ] AI responds appropriately

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 7: Team Management

### Test 7.1: View Team
```
Route: /dashboard/team
Actions:
1. Navigate to team page
2. Observe member list

Expected Results:
- [ ] Page loads correctly
- [ ] Current user shown as owner
- [ ] Team members listed (if any)
- [ ] Invite option available

Actual Result: [PASS/FAIL]
Notes:
```

### Test 7.2: Invite Team Member
```
Actions:
1. Click "Invite Member"
2. Enter email address
3. Select role
4. Send invitation

Expected Results:
- [ ] Invitation sent
- [ ] Pending invite shown
- [ ] Email received (if configured)

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 8: Settings

### Test 8.1: User Settings
```
Route: /dashboard/settings
Actions:
1. Navigate to settings
2. Update profile information
3. Save changes

Expected Results:
- [ ] Current data pre-filled
- [ ] Changes save successfully
- [ ] Success feedback shown

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 9: Error Handling

### Test 9.1: Invalid Project ID
```
Actions:
1. Navigate to /dashboard/projects/invalid-uuid-here

Expected Results:
- [ ] Graceful error handling
- [ ] Redirect or error page
- [ ] No crash or blank screen

Actual Result: [PASS/FAIL]
Notes:
```

### Test 9.2: Network Error Simulation
```
Actions:
1. Disconnect internet
2. Try to send chat message
3. Try to upload document

Expected Results:
- [ ] Error message displayed
- [ ] No data loss
- [ ] Retry option available

Actual Result: [PASS/FAIL]
Notes:
```

### Test 9.3: API Rate Limit
```
Actions:
1. Send multiple rapid messages
2. Observe behavior

Expected Results:
- [ ] Rate limiting applied (if configured)
- [ ] User-friendly message
- [ ] No crashes

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Suite 10: Performance

### Test 10.1: Page Load Times
```
Actions:
1. Clear cache
2. Load each main page
3. Measure time to interactive

Expected Results:
- [ ] Dashboard < 2s
- [ ] Project page < 2s
- [ ] Meeting page < 3s
- [ ] No blocking resources

Actual Result: [PASS/FAIL]
Notes:
```

### Test 10.2: Chat Response Time
```
Actions:
1. Send message in meeting
2. Measure time to first token

Expected Results:
- [ ] First token < 2s
- [ ] Streaming smooth
- [ ] No timeouts

Actual Result: [PASS/FAIL]
Notes:
```

---

## Test Execution Instructions

### Phase 1: Execute All Tests
Run through each test suite systematically:
1. Document actual results
2. Take screenshots of failures
3. Note any unexpected behavior

### Phase 2: Fix Critical Issues
For any FAIL results:
1. Identify root cause
2. Implement fix
3. Re-test to confirm

### Phase 3: Generate Report
```markdown
## Test Report Summary

### Overall Status: [PASS/FAIL/PARTIAL]

### Test Results by Suite:
| Suite | Total | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| Authentication | X | X | X | X |
| Projects | X | X | X | X |
| Knowledge Base | X | X | X | X |
| Meetings | X | X | X | X |
| RAG & Context | X | X | X | X |
| Localization | X | X | X | X |
| Team | X | X | X | X |
| Settings | X | X | X | X |
| Error Handling | X | X | X | X |
| Performance | X | X | X | X |

### Critical Issues Found:
1. [Issue description + fix applied]
2. [Issue description + fix applied]

### Recommendations:
1. [Recommendation]
2. [Recommendation]

### Files Modified:
- [file1.tsx] - [reason]
- [file2.ts] - [reason]
```

---

Begin with Test Suite 1: Authentication Flow.
Report results after each suite before proceeding to the next.