# Tutor Support System

This is the project submission for the course **Software Engineer (sem HK251)**, conducted at Ho Chi Minh City University of Technology (HCMUT), under the instruction of **Dr.Truong Thi Thai Minh**.

The **Tutor Support System (TSS)** is an integrated platform designed to modernize and scale the university's Tutor/Mentor program. The primary goal is to provide an efficient, secure, and data-driven platform for connecting students with authorized tutors.

---

## Project Overview & Key Features

The TSS implements a Minimal Viable Product (MVP) that emphasizes security, reliability, and clear administrative oversight.

### Core Functional Modules (Implemented)
* **Secure Authentication:** Integrated with **HCMUT\_SSO** for unified, secure login.
* **Role-Based Access Control (RBAC):** Enforces permissions for complex roles including Tutor, Student, Department Chair, and Staff.
* **Advanced Scheduling:** Supports tutor availability management, conflict checking, session booking, and complex negotiation flow for modification.
* **Tutor Management:** Implements administrative assignment logic, allowing managers (*Dept Chair*) to manually assign tutors and override automatic matching.
* **Feedback & Progress:** Enables students to submit structured feedback and allows tutors to record mentee progress.
* **Reporting & Analytics:** Provides aggregated data for the *Office of Academic Affairs* (Workload) and *Office of Student Affairs* (Participation Outcomes).

### Integration Strategy
The system is built on a Layered Architecture and uses Snapshotting *(Denormalization)* to ensure quick response times while maintaining data integrity from external sources.

* **HCMUT\_DATACORE** *(Simulated)*: Used as the ultimate source of truth for core personal and academic data (Read-only synchronization).
* **HCMUT\_LIBRARY** *(Simulated)*: Allows linking and sharing of external learning resources within sessions.

---

## Structure
- `current-latex/`: report-related files (supporting documentation and diagrams).
- `submission/`: our submission throughout this course.
- `code/`: include frontend and backend code. for further information, please read `README.md` in corresponding folder.