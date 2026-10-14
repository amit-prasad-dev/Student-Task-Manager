# REST API Specification

## 1. Overview & Conventions

- **Base URL**: `http://localhost:8080/api/v1`
- **Content Type**: `application/json`
- **Character Encoding**: `UTF-8`
- **Date/Time Format**: ISO 8601 string (e.g., `2026-10-18T14:30:00Z` or `null`)
- **Frontend Date Sanitization Note**: Form inputs (`<input type="datetime-local" />`) leave empty strings `""` when cleared. The frontend service layer converts blank strings to `null` (`dueDate: dateValue || null`) before transmission to prevent Jackson parsing failures.

### Standard HTTP Status Codes

| Status Code | Meaning | Usage in this Application |
|---|---|---|
| `200 OK` | Request succeeded | Standard response for successful `GET`, `PUT`, `PATCH`. |
| `201 Created` | Resource created | Standard response for successful `POST`. Returns the created resource. |
| `204 No Content` | Success, no body | Successful `DELETE` operation. |
| `400 Bad Request` | Client validation failure | Malformed JSON or failed bean validation constraints (`@Valid`). |
| `404 Not Found` | Resource not found | Requested task ID does not exist. |
| `500 Server Error` | Unhandled error | Unexpected server exception (masked from raw stack traces). |

---

## 2. Standardized Error Response Format

Whenever an API request fails (`4xx` or `5xx`), the server returns a structured error response:

```json
{
  "timestamp": "2026-10-14T20:15:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/v1/tasks",
  "fieldErrors": [
    {
      "field": "title",
      "rejectedValue": "",
      "message": "Title must not be blank"
    }
  ]
}
```

---

## 3. Phase 1 Task Endpoints (`/api/v1/tasks`)

### 3.1 Get All Tasks (with Search, Filter & Sort)
- **Method**: `GET`
- **Path**: `/api/v1/tasks`
- **Query Parameters**:
  - `search` *(optional, string)*: Case-insensitive keyword search matching the task title.
  - `status` *(optional, string)*: Filter by `PENDING`, `IN_PROGRESS`, or `COMPLETED`.
  - `taskType` *(optional, string)*: Filter by `ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, or `REVISION`.
  - `priority` *(optional, string)*: Filter by `LOW`, `MEDIUM`, or `HIGH`.
  - `overdue` *(optional, boolean)*: Set to `true` to return only uncompleted tasks where `dueDate < now`.
  - `sortBy` *(optional, string, default: `dueDate,asc`)*:
    - `dueDate,asc` (nearest deadline first; tasks without due dates appear at the end)
    - `dueDate,desc` (furthest deadline first)
    - `priority,desc` (**`HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`**, ordered via JPQL `CASE` mapping)
    - `priority,asc` (**`LOW` $\rightarrow$ `MEDIUM` $\rightarrow$ `HIGH`**, ordered via JPQL `CASE` mapping)
    - `createdAt,desc` (newest tasks first)
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "title": "LeetCode 75: Binary Tree Traversal",
    "description": "Practice recursive and iterative DFS / BFS implementations.",
    "dueDate": "2026-10-16T18:00:00",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "taskType": "CODING_PRACTICE",
    "isOverdue": false,
    "createdAt": "2026-10-14T19:00:00",
    "updatedAt": "2026-10-14T19:30:00"
  },
  {
    "id": 2,
    "title": "Draft Computer Architecture Revision Notes",
    "description": "Review pipelining and cache hierarchy.",
    "dueDate": null,
    "priority": "LOW",
    "status": "PENDING",
    "taskType": "REVISION",
    "isOverdue": false,
    "createdAt": "2026-10-14T19:10:00",
    "updatedAt": "2026-10-14T19:10:00"
  }
]
```

---

### 3.2 Get Task by ID
- **Method**: `GET`
- **Path**: `/api/v1/tasks/{id}`
- **Response**: `200 OK` (Single Task Object) or `404 Not Found`

---

### 3.3 Create New Task (`TaskCreateDTO`)
- **Method**: `POST`
- **Path**: `/api/v1/tasks`
- **Request Body**:
```json
{
  "title": "Calculus Quiz 2 Preparation",
  "description": "Solve practice set 4 on integration by parts.",
  "dueDate": "2026-10-18T10:00:00",
  "priority": "MEDIUM",
  "status": "PENDING",
  "taskType": "EXAM"
}
```
- **Validation Rules (`TaskCreateDTO`)**:
  - `title`: Mandatory (`@NotBlank`, `@Size(min = 3, max = 100)`)
  - `description`: Optional (`@Size(max = 1000)`)
  - `dueDate`: Optional. When provided, must not be in the past (`@FutureOrPresent`). Accepts `null`.
  - `priority`: Mandatory. Allowed values: `LOW`, `MEDIUM`, `HIGH` (default: `MEDIUM`)
  - `status`: Mandatory. Allowed values: `PENDING`, `IN_PROGRESS`, `COMPLETED` (default: `PENDING`)
  - `taskType`: Mandatory. Allowed values: `ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, `REVISION` (default: `ASSIGNMENT`)
- **Response**: `201 Created` with the newly created Task JSON.

---

### 3.4 Update Existing Task (`TaskUpdateDTO`)
- **Method**: `PUT`
- **Path**: `/api/v1/tasks/{id}`
- **Request Body**:
```json
{
  "title": "Calculus Quiz 2 Preparation (Extended)",
  "description": "Solve practice set 4 & 5 on integration by parts.",
  "dueDate": "2026-10-18T10:00:00",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "taskType": "EXAM"
}
```
- **Validation Rules (`TaskUpdateDTO`)**:
  - `title`: Mandatory (`@NotBlank`, `@Size(min = 3, max = 100)`)
  - `description`: Optional (`@Size(max = 1000)`)
  - `dueDate`: Optional. Accepts valid ISO-8601 string or `null`. **Does NOT enforce `@FutureOrPresent`**, allowing overdue tasks to be edited without requiring artificial deadline alterations.
  - `priority`: Mandatory. Allowed values: `LOW`, `MEDIUM`, `HIGH`
  - `status`: Mandatory. Allowed values: `PENDING`, `IN_PROGRESS`, `COMPLETED`
  - `taskType`: Mandatory. Allowed values: `ASSIGNMENT`, `CODING_PRACTICE`, `EXAM`, `REVISION`
- **Response**: `200 OK` with updated Task JSON or `404 Not Found`.

---

### 3.5 Quick Status Update (Toggle Status)
- **Method**: `PATCH`
- **Path**: `/api/v1/tasks/{id}/status`
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
- **Validation Rules**:
  - `status`: `@NotNull`, must be one of `PENDING`, `IN_PROGRESS`, `COMPLETED`.
- **Response**: `200 OK` with updated Task JSON.

---

### 3.6 Delete Task
- **Method**: `DELETE`
- **Path**: `/api/v1/tasks/{id}`
- **Response**: `204 No Content` or `404 Not Found`.

---

## 4. Phase 1 Dashboard Summary Endpoint (`/api/v1/dashboard/stats`)

Provides aggregated counts for the student's study overview bar:
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/stats`
- **Response**: `200 OK`

```json
{
  "totalTasks": 15,
  "pendingTasks": 6,
  "inProgressTasks": 4,
  "completedTasks": 5,
  "overdueTasks": 2
}
```

---

## 5. Future Endpoints (Planned for Phase 2 & Beyond)

These endpoints are documented for architectural foresight and will be implemented in subsequent phases:

### Phase 2: Course Management (`/api/v1/courses`)
- `GET /api/v1/courses` - List all courses with active task counts
- `POST /api/v1/courses` - Create new course with color badge
- `PUT /api/v1/courses/{id}` - Update course details
- `DELETE /api/v1/courses/{id}` - Delete course (uncategorizes associated tasks)

### Phase 3: Analytics & Productivity (`/api/v1/analytics`)
- `GET /api/v1/analytics/study-breakdown` - Tasks grouped by task type and completion status
- `GET /api/v1/analytics/completion-trends` - Weekly/monthly task completion history
