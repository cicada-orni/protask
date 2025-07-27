ADR-001: Multi-Tenant, Normalized Data Model for a Collaborative SaaS
Status: Accepted

Date: 2025-07-27

Context
The ProTask application is a Software-as-a-Service (SaaS) product designed to be used by multiple, distinct customer organizations (tenants). The primary architectural challenge is ensuring strict data isolation between these tenants. A user from one tenant must never, under any circumstances, be able to access, view, or modify data belonging to another tenant.

A simplistic, flat data model (where, for example, all projects from all tenants live in a single table distinguished only by an owner_id) would lead to complex, brittle, and error-prone application logic. The risk of a single bug causing a catastrophic data leak would be unacceptably high. Therefore, a foundational decision is required to enforce multi-tenancy at the deepest possible layer: the database schema itself.

Decision
We will adopt a normalized, workspace-centric relational data model.

The workspaces table will serve as the root of the data hierarchy for each tenant. Every other piece of business data (projects, boards, tasks, etc.) will be linked back to a workspace via a chain of non-nullable foreign keys.

User access and roles will be managed through a dedicated join table, workspace_members. This table explicitly links a user_id from the auth.users table to a workspace_id, creating a many-to-many relationship and defining the user's role within that specific workspace.

Data integrity will be enforced using PostgreSQL's built-in features, including FOREIGN KEY constraints with ON DELETE CASCADE to ensure that deleting a parent record (like a workspace) automatically and cleanly removes all its child records (projects, members, etc.).

Consequences
Positive
Strong Data Isolation: This model provides the strongest possible guarantee of tenant data separation. Security is enforced at the database layer, which is more reliable and less prone to application-level bugs.

Simplified Application Logic: Because the database enforces the hierarchy, application code for fetching data becomes simpler and more secure. We can rely on these database-level guarantees instead of scattering security checks throughout the codebase.

Extensibility and Scalability: The normalized, relational structure is highly extensible. Adding new features or entities that belong to a workspace is straightforward and follows a clear, established pattern.

Negative
Increased Initial Complexity: The initial setup of this schema is more complex than a simple flat model. It requires a deeper understanding of relational database design and concepts like foreign keys and join tables.

More Complex Queries: Fetching nested data for the frontend (e.g., all tasks for a specific project) will often require queries with multiple JOINs, which can be more complex to write and potentially less performant if not properly indexed.

This trade-off is explicitly accepted. The long-term benefits of robust security, data integrity, and maintainability far outweigh the initial development complexity.
