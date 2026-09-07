# 1. Overview

This project is developed as part of the Projeto 50+10 initiative within the 2nd year of the Bachelor's Degree in Computer Systems Engineering at IPCA, during the 2025/2026 academic year.

The project aims to establish a practical connection between the following Course Units:

**Software Development Project (PDS):** Focus on lifecycle management, architecture, and Back-end development.
**Web Programming (PW):** Focus on Front-end development and user experience.

# 2. Scope and Client

The central theme of the project is **"Costume Management"**, developed in collaboration with the external organization **Entartes**.

The objective is to develop a complete software solution that addresses the identified needs, from requirements analysis through to the final product delivery.

# 3. Architecture and Technology Stack

The system follows a distributed architecture with a clear separation between client and server, communicating through a RESTful API.

**Front-end:** React
**Back-end:** Node.js
**Database:** PostgreSQL
**Version Control:** Git

# 4. Work Methodology

The team follows the **Scrum** methodology for iterative planning and development management.

**Sprints:** Development cycles with an average duration of 2 weeks.
**Management:** Task (Backlog), Bug, and Sprint tracking is carried out entirely on the Azure DevOps platform.
**Team:** 5 members.

# 5. Main Milestones

The planning is aligned with the mandatory deliverables of the Course Units:

**Requirements Analysis and Modelling:** Specification, diagrams (BPMN, UML), and mockups — March.
**Beta Version (vBeta):** Main features implemented and tested — Date to be defined.
**RTW (Ready to Web) Version:** Final, optimized version ready for production — May.
**Final Presentation:** Project defense on May 29, 2026.

# 6. Marketplace Technical Note

To accelerate the implementation of the Marketplace's temporal lifecycle without modifying the E-R model at this stage, the `dataaprovacao` field has been reused as the **"date of the last decision"** for an advertisement:

* When an advertisement is published, `dataaprovacao` stores the publication date.
* When an advertisement is rejected, `dataaprovacao` stores the rejection date.

Based on this date and the advertisement's current status, the backend applies the following time-based checks:

* `Rejected` for more than 3 days is moved to `Archived` (soft delete).
* `Published` for more than 30 days is moved to `Pending Renewal`.

# 7. Image Policy (Marketplace)

To keep the project within the free-tier limits while maintaining good performance, Marketplace advertisements follow the following policy:

* Maximum of `5` images per advertisement.
* Maximum size of `2MB` per image.
* Accepted formats: `JPG`, `PNG`, and `WEBP`.

**Storage:**

* Images are uploaded to Supabase Storage (bucket configurable through `SUPABASE_STORAGE_BUCKET`, with `marketplace-images` as the default).
* Images are organized into advertisement-specific folders under `marketplace/<id_anuncio>/...`.
* Public URLs are dynamically resolved from Storage when advertisements are retrieved.
