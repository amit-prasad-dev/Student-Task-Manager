# AGENTS.md - Developer & Agent Guide for Student Task Manager

Welcome to the **Student Task Manager** project! This repository is an educational full-stack application built with **Java (Spring Boot)** and **React (Vite)**.

This guide outlines our architecture, code style, conventions, security rules, phased roadmap, and learning-first pair-programming expectations.

---

## 1. Project Philosophy & Learning-First Workflow

Because this is an educational project:
1. **Explain the "Why"**: Always explain why a design pattern, annotation, or technique is chosen before or during code implementation.
2. **Step-by-Step Evolution**: Break down complex implementations into manageable, educational steps rather than generating large monolithic blocks of code.
3. **Keep Phase 1 Beginner-Friendly**: Start with core single-entity CRUD operations and clear data flows. Defer advanced multi-table relationships, security filters, and complex animations to future phases.
4. **No Hidden Magic**: Clarify what framework features do behind the scenes (e.g., how Spring Boot `@Autowired`, JPA repositories, Hibernate proxies, and React component lifecycle hooks operate).
5. **Interactive Decisions**: Consult before introducing external libraries, altering database schemas, or modifying architectural patterns.

---

## 2. Phased Roadmap Overview

To maintain a smooth learning curve, the project evolves in distinct phases:

* **Phase 1: Student Study Planner (Current Focus)**
  * Single-entity Task CRUD focused on student study workflows: **assignments**, **coding practice**, **exams**, and **revision**.
  * Core fields: `title`, optional `description`, optional `dueDate`, `priority` (`LOW`, `MEDIUM`, `HIGH`), `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and `taskType` (`ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, `REVISION`).
  * Search by title, filter by status and overdue items, and sort by due date, priority, and creation date.
  * Responsive UI with dashboard summary counts, input validation, delete confirmation modals, and optional light/dark theme toggle.
  * No authentication/login required in this phase.
* **Phase 2: Course & Category Organization (Future)**
  * Course/subject categorization with color badges, multi-table foreign keys, and optional simple to-do list mode.
* **Phase 3: Advanced Dashboard & Productivity Features (Future)**
  * Charts, study velocity analytics, and interactive UI micro-animations.
* **Phase 4: Authentication, Cloud Deployment & Polish (Future)**
  * User registration and login (Spring Security + JWT), production packaging, and cloud deployment.

---

## 3. Technology Stack

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend** | React 19 (via Vite 8) | JavaScript (ES6+), CSS, Fetch API; Node.js `^20.19.0` or `>=22.12.0` |
| **Backend** | Java 25 & Spring Boot 4.1.1 | Spring Web MVC, Spring Data JPA, Hibernate, Bean Validation |
| **Database** | MySQL 8.x | Relational schema, InnoDB engine |
| **Build Tools** | Maven (backend) / npm (frontend) | Standard multi-folder structure |
| **API Protocol** | RESTful JSON | Standard HTTP status codes and error payloads |
| **Version Control** | Git & GitHub | Semantic commits, feature branches |

---

## 4. Directory Layout (Monorepo)

```text
Student-Task-Manager/
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/studenttaskmanager/
│   │   │   │   ├── controller/     # REST Controllers (e.g., TaskController)
│   │   │   │   ├── service/        # Business logic interfaces & implementations
│   │   │   │   ├── repository/     # Spring Data JPA repositories (TaskRepository)
│   │   │   │   ├── model/
│   │   │   │   │   ├── entity/     # JPA Entities (e.g., Task)
│   │   │   │   │   ├── dto/        # Request & Response DTOs
│   │   │   │   │   └── enums/      # Priority, TaskStatus, TaskType
│   │   │   │   ├── exception/      # Global exception handler & custom exceptions
│   │   │   │   └── config/         # CORS configuration and beans
│   │   │   └── resources/
│   │   │       └── application.properties # Database connection and JPA configuration
│   │   └── test/                   # JUnit 5 & Mockito tests
│   ├── .mvn/wrapper/               # Maven Wrapper configuration
│   ├── mvnw / mvnw.cmd             # Maven Wrapper launchers
│   └── pom.xml                     # Maven project configuration
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── assets/                 # Images and static assets
│   │   ├── components/             # Navbar, task cards/forms, controls, dashboard, dialogs
│   │   ├── services/api.js         # Centralized API service methods
│   │   ├── App.jsx                 # Main application state and layout
│   │   ├── App.css / index.css     # Application and global styles
│   │   └── main.jsx                # React entrypoint
│   ├── package.json
│   └── vite.config.js
├── docs/                     # Specifications & learning documentation
│   ├── requirements.md       # Functional & non-functional requirements
│   ├── architecture.md       # Layered design & data flow
│   ├── database.md           # Current entity mapping and Hibernate schema setup
│   └── api-spec.md           # REST endpoints, request/response contracts
├── .gitignore
├── AGENTS.md                 # Agent and contributor rules (this file)
└── README.md                 # Project introduction and quickstart
```

---

## 5. Coding Conventions & Best Practices

### Backend (Java / Spring Boot)
- **Layered Architecture**: Strictly respect layer separation:
  - `Controller` handles HTTP requests, validation (`@Valid`), and delegates to `Service`.
  - `Service` encapsulates business logic, transaction boundaries (`@Transactional`), and entity-to-DTO mapping.
  - `Repository` interfaces extend `JpaRepository` and handle database queries.
  - `Entity` represents the database schema.
- **DTO Pattern & Separate Validation (Crucial Rule)**:
  - Never return or accept raw `@Entity` classes directly in REST controller methods. Always use dedicated Request and Response DTOs to avoid leaking persistence state or circular reference bugs.
  - **Decoupled Create and Update DTOs**:
    - `TaskCreateDTO`: Enforces `@NotBlank` on `title`, `@Size`, valid enums, and applies `@FutureOrPresent` on `dueDate` when provided (new tasks cannot be created with past deadlines).
    - `TaskUpdateDTO`: Allows editing tasks without forcing deadline changes. It validates formatting and constraints (`@NotBlank`, `@Size`), but **omits `@FutureOrPresent`** so that existing overdue tasks can be edited (e.g., updating notes, priority, or status) without throwing validation errors.
- **Priority Sorting Convention**:
  - Priority sorting must follow business precedence rather than database alphabetical order (`VARCHAR` sorting incorrectly puts `MEDIUM` before `HIGH` in descending order).
  - Descending: `HIGH` (1) → `MEDIUM` (2) → `LOW` (3).
  - Ascending: `LOW` (3) → `MEDIUM` (2) → `HIGH` (1).
  - Implement using a custom JPQL `CASE` expression or a service-layer comparator.
- **Naming Conventions**:
  - Classes: `PascalCase` (e.g., `TaskService`, `TaskRepository`).
  - Methods and variables: `camelCase` (e.g., `findByDueDateBefore`, `completedTasksCount`).
  - Constants & Enum values: `UPPER_SNAKE_CASE` (e.g., `CODING_PRACTICE`, `IN_PROGRESS`).
  - REST URLs: `kebab-case` and plural nouns (e.g., `/api/v1/tasks`).

### Frontend (React / JavaScript)
- **Component Organization**:
  - Keep components modular, focused, and small.
  - Reusable components reside in `components/`, page views in `pages/`.
- **State Management & API Communication**:
  - Prefer standard React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
  - Centralize API calls in `services/api.js` instead of scattering `fetch()` calls inside UI components.
  - **Date Input Sanitization**: Form inputs (`<input type="datetime-local" />`) that are left blank yield empty strings `""`. `api.js` must convert empty date strings to `null` (`dueDate: dateValue || null`) before sending JSON, preventing Jackson deserialization exceptions.
- **Styling**:
  - Use modern Vanilla CSS / CSS Modules with cohesive CSS Custom Properties (variables) for theme consistency (colors, shadows, radii, typography).
  - Support an optional light/dark theme switch cleanly via CSS variables on the root document.

---

## 6. Security Rules

1. **No Hardcoded Secrets**: Database passwords and credentials must never be hardcoded or checked into Git. Use environment variables or local properties files excluded by `.gitignore`.
2. **CORS Configuration**:
   - Restrict allowed origins strictly to the configured frontend development origin (`http://localhost:5173` for Vite). Do not use wildcard `*` origins with credentials.
   - Explicitly declare all required HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`. (Crucial for handling pre-flight checks and the `PATCH` status toggle).
3. **Input Sanitization & Parameterized Queries**: Rely on Spring Data JPA and Hibernate for SQL injection protection. Never concatenate user strings into raw SQL queries.
4. **Safe Error Responses**: Never return raw Java stack traces or internal database error messages to the client. Use a global `@ControllerAdvice` to format friendly error JSON.

---

## 7. Testing Strategy

- **Backend**:
  - Unit tests for services using **JUnit 5** and **Mockito** (mocking repository layers).
  - Web layer tests using `@WebMvcTest` or `MockMvc` to verify endpoint status codes, validation failures, and JSON formatting.
- **Frontend**:
  - Verify error handling and loading states in API communication.
  - Validate form input boundaries before submitting to the backend.

---

## 8. Change Management Checklist

Before presenting completed work:
1. Verify code compiles/builds without warnings.
2. Confirm the directory structure matches the agreed layout.
3. Ensure every newly added endpoint has an entry in [docs/api-spec.md](file:///c:/Users/Amit%20prasad/OneDrive/Desktop/Student-Task-Manager/docs/api-spec.md).
4. Clearly explain newly introduced concepts to maintain educational value.
