# Requirements Specification

## 1. Project Overview & Product Vision

The **Student Task Manager** begins in **Phase 1** as a focused, lightweight **Student Study Planner**. Its goal is to provide a clean, distraction-free environment for students to plan and track their core academic study obligations:
- **Assignments** (problem sets, essays, reports)
- **Coding Practice** (DSA challenges, projects, lab exercises)
- **Exams** (midterms, finals, quizzes)
- **Revision** (reviewing lecture slides, summary notes)

In later phases, the application will evolve into a full-featured **Student Productivity System** with multi-course categorization, daily to-do checklists, interactive charts, and user authentication.

---

## 2. Target User Persona
- **Role**: High school, undergraduate, or bootcamp student.
- **Goals**:
  - Keep track of upcoming deadlines across different study activities without unnecessary overhead.
  - Quickly see how many assignments or exam dates are pending or overdue.
  - Filter down to coding practice or revision tasks during dedicated study blocks.
- **Key Philosophy**: Simplicity first. Minimum required clicks to manage daily study goals.

---

## 3. Functional Requirements (FR)

### Phase 1: Student Study Planner (Current Scope)

#### FR-1: Task Management (Core CRUD)
- **FR-1.1: Create Task**
  - The student can create a new task with the following fields:
    - **Title** *(mandatory)*: String, 3 to 100 characters.
    - **Description** *(optional)*: Text, up to 1000 characters.
    - **Due Date & Time** *(optional)*: Date/time picker. If provided, must not be in the past upon creation.
    - **Priority** *(mandatory)*: Enum value: `LOW`, `MEDIUM`, or `HIGH` (default: `MEDIUM`).
    - **Status** *(mandatory)*: Enum value: `PENDING`, `IN_PROGRESS`, or `COMPLETED` (default: `PENDING`).
    - **Task Type** *(mandatory)*: Enum value: `ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, or `REVISION` (default: `ASSIGNMENT`).
- **FR-1.2: View Tasks**
  - The student can view the list of all study tasks rendered as cards/rows.
- **FR-1.3: View Task Details**
  - The student can view full details of a selected task (including full description and timestamps).
- **FR-1.4: Edit Task**
  - The student can edit all fields of an existing task. Editing existing overdue tasks is supported without requiring the student to alter past deadlines.
- **FR-1.5: Quick Status Update**
  - The student can quickly advance or toggle status (e.g., mark `PENDING` -> `IN_PROGRESS` or `COMPLETED`) directly from the card.
- **FR-1.6: Delete Task with Confirmation**
  - The student can delete a task. Clicking delete triggers a confirmation modal ("Are you sure you want to delete this task?") to prevent accidental data loss.

#### FR-2: Search, Filtering & Sorting
- **FR-2.1: Search by Title**
  - Real-time or debounced keyword search matching task titles.
- **FR-2.2: Filter by Status**
  - Filter tasks by `ALL`, `PENDING`, `IN_PROGRESS`, or `COMPLETED`.
- **FR-2.3: Filter by Task Type**
  - Filter tasks by study activity: `ALL`, `ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, or `REVISION`.
- **FR-2.4: Filter Overdue Items**
  - A one-click filter or toggle to view tasks that are past their due date and not marked `COMPLETED`.
- **FR-2.5: Sorting Options**
  - Sort by **Due Date**: nearest deadline first (`dueDate,asc`, tasks without due date listed at the end) or furthest first (`dueDate,desc`).
  - Sort by **Priority**: Descending (`HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`) or Ascending (`LOW` $\rightarrow$ `MEDIUM` $\rightarrow$ `HIGH`).
  - Sort by **Creation Date**: newest first (`createdAt,desc`).

#### FR-3: Dashboard Summary Counts
- **FR-3.1: Total Tasks**: Count of all created tasks.
- **FR-3.2: Pending Tasks**: Count of tasks with status `PENDING`.
- **FR-3.3: In Progress Tasks**: Count of tasks with status `IN_PROGRESS`.
- **FR-3.4: Completed Tasks**: Count of tasks with status `COMPLETED`.
- **FR-3.5: Overdue Tasks**: Count of uncompleted tasks whose due date has passed.

#### FR-4: User Interface & Theme
- **FR-4.1: Responsive Design**: Fully usable across mobile, tablet, and desktop screens.
- **FR-4.2: Visual Type & Priority Indicators**: Color-coded badges for task types and priority levels.
- **FR-4.3: Theme Support (Optional)**: Optional light/dark mode switch persisted in browser storage.
- **FR-4.4: No Authentication in Phase 1**: Open single-user interface running locally; no login or registration barriers.

---

### Future Scope (Later Phases)

#### Phase 2: Course Organization & Simple To-Do Mode
- **FR-F1: Course/Subject Entities**: Group tasks by course code (e.g., `CS101`, `MATH201`) with customized badge colors.
- **FR-F2: Simple To-Do List Mode**: A streamlined checklist view for lightweight daily errands alongside academic tasks.

#### Phase 3: Advanced Dashboard & Productivity Features
- **FR-F3: Visual Analytics**: Graphical charts (completion velocity over time, task breakdown by study type).
- **FR-F4: UI Animations**: Micro-animations for task completion and card reordering.

#### Phase 4: Authentication & Cloud Deployment
- **FR-F5: User Accounts**: User registration, login, and secure session management (Spring Security + JWT).
- **FR-F6: Cloud Hosting**: Containerized Docker deployment with production MySQL hosting.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Responsiveness
- Backend REST API responses under **150ms** under local development conditions.
- Frontend rendering and search filtering executed with immediate reactivity.

### NFR-2: Usability & Error Feedback
- Form validation errors displayed clearly below the relevant input field.
- Toast notifications confirming task creation, updates, and deletion.

### NFR-3: Reliability & Data Integrity
- Database persistence backed by ACID-compliant MySQL InnoDB engine.
- Transactional integrity using Spring Boot `@Transactional` service methods.
- Input validation enforced at both client (HTML5/React) and server (Hibernate Validator `@Valid`) levels.

### NFR-4: Educational Clarity & Maintainability
- Clean separation of concerns (Controller, Service, Repository, DTO).
- Clear, readable code without obscure dependencies.
