# 🎓 Student Task Manager

A learning-focused, full-stack web application designed for students. The project starts in **Phase 1** as a **Student Study Planner** to organize assignments, coding practice, exams, and revision sessions, and will later expand into a comprehensive **Student Productivity System**.

---

## 🎯 Learning Objectives

This project is built from scratch as an educational step-by-step journey through modern full-stack web development:
- **Backend Architecture**: Building clean, maintainable RESTful APIs using **Java**, **Spring Boot**, **Spring Data JPA**, and **Hibernate**.
- **Relational Data Modeling**: Designing and optimizing a relational database schema in **MySQL** with appropriate data types, indexes, and transactional boundaries.
- **Frontend Development**: Creating an interactive, responsive single-page application using **React**, **Vite**, and modern component-driven **JavaScript/CSS**.
- **API Contracts & Integration**: Designing and consuming structured JSON APIs with the Data Transfer Object (DTO) pattern and centralized error handling.
- **Engineering Best Practices**: Layered architecture, automated unit tests, clean git commits, and beginner-friendly documentation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18+ (powered by Vite), modern JavaScript (ES6+), Vanilla/Modular CSS
- **Backend**: Java 17/21, Spring Boot 3.x (Spring Web, Spring Data JPA, Hibernate, Bean Validation)
- **Database**: MySQL 8.x (InnoDB engine)
- **API Standard**: RESTful JSON over HTTP
- **Version Control**: Git + GitHub

---

## 🗺️ Project Roadmap & Phased Evolution

### 📌 Phase 1: Student Study Planner (Current Focus — Beginner-Friendly MVP)
*Goal: Master single-entity CRUD, REST conventions, form validation, and state synchronization.*
- [ ] **Task CRUD**: Create, view, edit, and delete study tasks with delete confirmation.
- [ ] **Core Attributes**:
  - `title` *(required, 3–100 chars)*
  - `description` *(optional, detailed notes)*
  - `dueDate` *(optional; future/present date upon creation, existing past dates allowed on update)*
  - `priority` *(`LOW`, `MEDIUM`, `HIGH`)*
  - `status` *(`PENDING`, `IN_PROGRESS`, `COMPLETED`)*
  - `taskType` *(`ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, `REVISION`)*
- [ ] **Search & Filtering**: Search by title; filter by status and overdue items; filter by task type.
- [ ] **Sorting**: Sort by due date (nearest first), priority, and creation date.
- [ ] **Dashboard Summary Counts**: Real-time counts for Total, Pending, In Progress, Completed, and Overdue tasks.
- [ ] **User Experience**: Responsive layout, robust validation feedback, and optional light/dark mode switch.
- [ ] **No Login/Auth in Phase 1**: Kept intentionally accessible and lightweight for educational focus.

---

### 🚀 Later Phases (Future Expansion)

#### Phase 2: Course Organization & Simple To-Do Mode
- Multi-table relationships: Categorize tasks by Course/Subject (e.g., *CS101*, *MATH201*) with custom color badges.
- Simple daily To-Do checklist mode alongside structured study tasks.

#### Phase 3: Complete Student Productivity System & Advanced Dashboard
- Visual progress charts (study velocity, completion trends, time allocation).
- Smooth micro-animations and status transition effects.

#### Phase 4: Authentication, Cloud Deployment & Multi-User Support
- User registration and login (Spring Security + JWT).
- Cloud deployment (containerization with Docker, cloud database hosting).

---

## 📂 Project Directory Structure

```text
Student-Task-Manager/
├── backend/                  # Spring Boot application (REST API service)
├── frontend/                 # React + Vite application (UI client)
├── docs/                     # Technical specifications & documentation
│   ├── requirements.md       # Functional & non-functional requirements
│   ├── architecture.md       # System design, layered backend, and data flows
│   ├── database.md           # MySQL schema, table definitions, and ER diagram
│   └── api-spec.md           # API endpoints, request/response models
├── .gitignore                # Git ignore rules for Java, Node, IDEs
├── AGENTS.md                 # Agent guidance, coding conventions & security rules
└── README.md                 # This project overview document
```

---

## 💻 Prerequisites & Setup (Verified Environment)

Before generating or running application code, verify your local development environment:
- **Operating System**: Windows
- **Java Development Kit (JDK)**: Java 17 or higher (`java -version`)
- **Node.js & npm**: Node.js v18+ and npm v9+ (`node -v`, `npm -v`)
- **MySQL Server**: Running instance of MySQL 8.x (`mysql -u root -p`)
- **Git**: Installed and configured (`git --version`)
- **IDE**: Antigravity IDE / VS Code / IntelliJ IDEA

---

## 📚 Technical Documentation

Explore the updated technical documentation in [`docs/`](./docs):
- [Requirements Specification](docs/requirements.md)
- [System Architecture & Data Flow](docs/architecture.md)
- [Database Schema & ER Design](docs/database.md)
- [REST API Specifications](docs/api-spec.md)
- [Agent & Contributor Rules](AGENTS.md)
