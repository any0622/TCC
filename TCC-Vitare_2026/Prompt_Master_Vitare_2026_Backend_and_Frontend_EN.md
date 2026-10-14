# MASTER PROMPT — COMPLETE ARCHITECTURAL RECONSTRUCTION OF THE VITARE 2026 BACKEND

## 1. IDENTITY, RESPONSIBILITIES, AND TASK OBJECTIVE

Act simultaneously as:

- A Senior Software Architect specializing in Clean Architecture, Domain-Driven Design (DDD), SOLID, and modular architecture.
- A Senior Backend Engineer specializing in NestJS, TypeScript, Prisma ORM, and PostgreSQL.
- A Distributed Systems Engineer with experience in Redis, idempotency, distributed caching, and transactional consistency.
- An Application Security Engineer with experience in authentication, RBAC authorization, protection of clinical information, and auditing.
- A Software Engineer specializing in monitoring systems, geolocation, real-time communication, and applications with intermittent connectivity.
- A Quality Engineer responsible for unit, integration, and E2E tests, migrations, and reproducible builds.

Your task is to **analyze, refactor, fix, and directly complete the existing backend of the Vitare 2026 project**, applying Clean Architecture, Domain-Driven Design, SOLID principles, Redis, and the other improvements described in this document.

Do not limit yourself to presenting a theoretical architecture, suggesting files, or providing isolated examples. Work on the existing source code, modify the necessary files, implement the features, fix the inconsistencies found, run the available checks, and present evidence of the work performed.

The goal is not merely to make the project compile. The result must provide a coherent architecture, explicit business rules, appropriate security, data consistency, useful tests, functional integration between modules, and maintainability.

**Do not claim that a feature has been implemented or validated unless corresponding code and evidence consistent with the claim exist.**

---

## 2. PROJECT CONTEXT AND MANDATORY CONSTRAINTS

The project is Vitare 2026, a monorepo containing, among other components:

- `apps/api`: NestJS backend with TypeScript, Prisma ORM, and PostgreSQL.
- `apps/web`: patient-facing frontend, developed with React and Vite.
- `apps/web-staff`: operational frontend intended for monitoring and rescue professionals.
- `infra/local`: local execution and Docker configurations.
- `infra/public`: configurations used for public deployment.
- `prisma/`: schema, migrations, and Prisma-related artifacts, according to the existing organization.

The monorepo package manager is pnpm. The project uses Prisma 7 and has a client-generation configuration that writes to a custom directory. Verify the actual configuration files before changing any behavior.

The system already has functional modules for authentication, patients, medications, allergies, health conditions, contacts, reference dictionaries, emergencies, and staff.

The emergency module already has the `POST /api/v1/emergency/trigger` endpoint and stores a clinical snapshot in JSONB. Preserve what already works, evolving the contract and implementation in a controlled manner.

The frontend uses React + Vite, and the operational staff feed currently queries the API over HTTP. Do not assume that the project uses Next.js.

### 2.1. Absolute constraints

1. Do not rewrite the project from scratch.
2. Do not remove existing features without a documented technical need.
3. Do not change the frontends' visual identity, colors, layout, typography, components, or navigation.
4. Do not migrate the frontend to Next.js or another framework.
5. Do not replace PostgreSQL with MongoDB or another database.
6. Do not replace Prisma with a different ORM.
7. Do not introduce microservices, Kafka, gRPC, or additional enterprise infrastructure without a concrete need.
8. Do not recreate fields or tables that already exist under another name without a migration rationale.
9. Do not reintroduce `schedules` in the medications module: preserve the architectural decision to use `frequency` to represent periodicity, in accordance with the existing model.
10. Do not silently change endpoints, response formats, business states, or fields used by the frontends.
11. Do not remove the contents of previous migrations or perform destructive operations on existing data.
12. Do not use fictitious clinical data as if it were official medical information.
13. Do not expose secrets contained in environment files, logs, reports, or responses.
14. Do not mark tests as passed if they have not been run.
15. Do not leave important implementations as pseudocode, `TODO` comments, empty methods, or mocked returns.
16. Do not stop working after producing a plan. Carry out the changes possible in the environment.
17. Do not ask for confirmation at every step. Inspect the code, make technically justified decisions, and proceed, clearly reporting actual limitations.

If any feature depends on an external service, a missing credential, or a clinical decision that cannot be safely inferred, implement the structure and contracts that are possible, document the dependency, and do not simulate a nonexistent integration.

---

# 3. PHASE ZERO — MANDATORY INVENTORY AND DIAGNOSTICS

Before changing any file, systematically inspect the repository.

Examine at least:

- The root `package.json`.
- `pnpm-workspace.yaml`.
- `pnpm-lock.yaml`.
- `apps/api/package.json`.
- `apps/api/src/main.ts`.
- `apps/api/src/app.module.ts`.
- NestJS configuration.
- Global guards, pipes, filters, and interceptors configuration.
- Prisma configuration.
- `schema.prisma`.
- All existing migrations.
- All modules in `apps/api/src/modules/`.
- All existing controllers, services, repositories, DTOs, and entities.
- The HTTP contracts actually used by `apps/web` and `apps/web-staff`.
- The frontends' authentication services and HTTP calls, only to verify compatibility.
- `infra/local`.
- `infra/public`.
- `.dockerignore`, `.gitignore`, Dockerfiles, and Compose files.
- Test, ESLint, TypeScript, and build-script configuration.
- The current implementation of caching, snapshots, geolocation, and notifications.

Verify which components actually exist and which are incomplete.

Internally produce a traceability matrix with four columns:

1. Requirement.
2. Related current files or components.
3. Required change.
4. Evidence of completion.

Do not use the structure suggested in this prompt as a substitute for analyzing the actual code. The repository is the source of truth for current names, contracts, and behaviors.

### 3.1. Known issues that must be reassessed

The previous audit found indications of, or concrete occurrences of, the following issues:

- Public staff registration through a route marked as public, with the possibility of receiving `role` from the client.
- Repository contracts that import Prisma-generated types.
- Tests with imports incompatible with their respective modules.
- Service tests that lack all dependencies required to initialize the test modules.
- Lack of persistent idempotency for emergency triggering.
- Lack of a complete Outbox queue for offline synchronization.
- Lack of a complete WebSocket implementation for the operational feed.
- Different entry points between local and public Dockerfiles.
- Lack of explicit Prisma client generation in the local build workflow.
- A health check that may not actually verify PostgreSQL availability.
- Possible inconsistency between the declared expiration and the expiration actually enforced by part of the frontend cache.
- Possible exposure of credentials in environment files and secrets directories.

Confirm the issues in the current state before fixing them. If they have already been resolved in later versions, preserve the existing fix.

### 3.2. File security

If you find credentials, private keys, JWT secrets, OAuth tokens, database credentials, or infrastructure tokens:

- Do not reproduce them in the terminal, logs, or final response.
- Do not copy them into new files.
- Do not include them in examples or documentation.
- Correct exclusion rules and configuration-loading mechanisms.
- Use fictitious values in `.env.example` files.
- Report only the category of exposure identified and the recommended rotation action.

Do not attempt to change a production credential directly without authorized access to the respective service. If external rotation is required, document the necessary operation without revealing the secret.

---

# 4. TARGET ARCHITECTURE: CLEAN ARCHITECTURE, DDD, AND SOLID

Implement a consistent architecture across the 12 functional modules defined in the following section.

The organization should favor vertical modules by domain, keeping application, domain, infrastructure, and presentation responsibilities separate.

Reference structure:

```text
apps/api/src/
├── main.ts
├── app.module.ts
│
├── modules/
│   ├── auth/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── auth.module.ts
│   │
│   ├── patients/
│   ├── medications/
│   ├── medications-dictionary/
│   ├── allergies/
│   ├── conditions/
│   ├── disease-dictionary/
│   ├── contacts/
│   ├── forbidden-medications/
│   ├── emergency/
│   ├── staff/
│   └── health/
│
├── infrastructure/
│   ├── database/
│   │   ├── prisma/
│   │   └── transactions/
│   ├── cache/
│   │   └── redis/
│   ├── messaging/
│   └── observability/
│
└── shared/
    ├── domain/
    ├── application/
    └── infrastructure/
```

This structure is a guideline. Reuse existing shared modules and services when technically appropriate. Avoid moving hundreds of files merely to reproduce this tree literally.

## 4.1. Domain Layer

The domain layer should contain, when necessary:

- Entities.
- Value Objects.
- Aggregates and their roots.
- Domain services.
- Domain events.
- Policies and business rules.
- Domain exceptions.
- Internal contracts whose responsibility belongs to the domain.
  Do not import:

- `@nestjs/common`.
- `@nestjs/core`.
- `@prisma/client` or the generated Prisma client.
- Controllers.
- HTTP DTOs.
- Concrete Redis implementations.
- Infrastructure classes.

Do not place important clinical rules exclusively in the frontend, controller, or Prisma repository.

Do not turn every database table into an artificial rich entity. Use DDD pragmatically, explicitly modeling the behaviors and invariants that actually matter.

## 4.2. Application Layer

Contains specific use cases, for example:

- `RegisterPatientUseCase`.
- `AuthenticateUserUseCase`.
- `RotateRefreshTokenUseCase`.
- `UpdatePatientProfileUseCase`.
- `AddMedicationUseCase`.
- `CreateEmergencyUseCase`.
- `AcknowledgeEmergencyUseCase`.
- `AssignRescuerUseCase`.
- `ResolveEmergencyUseCase`.
- `ListEmergenciesUseCase`.

Use cases must:

- Receive well-defined inputs.
- Coordinate the required components.
- Invoke domain rules.
- Depend on contracts rather than concrete implementations.
- Define predictable results and errors.
- Delimit the operations that need to participate in transactions.
- Respect authentication, authorization, and data-ownership rules.

Do not concentrate all logic in enormous generic services.

Do not create a separate use case for every trivial operation when this adds no clarity.

## 4.3. Infrastructure Layer

Contains:

- Concrete implementations of Prisma repositories.
- Redis client and adapters.
- Cache implementations.
- Outbox persistence.
- Event-publishing adapters.
- WebSocket and Socket.IO integration.
- Integration with external providers.
- Transaction adapters.
- Technical configurations and observability mechanisms.

Adapters implement the application's internal abstractions.

## 4.4. Presentation Layer

Contains:

- REST controllers.
- Input and output DTOs.
- Guards.
- Pipes.
- Interceptors.
- HTTP filters.
- Real-time communication gateways, as presentation adapters.
- Transformation of HTTP inputs into application commands.

Controllers must be thin. They must not import Prisma directly, construct SQL queries, apply extensive clinical rules, or control Outbox consistency.

## 4.5. Dependency direction

Ensure that:

- The domain is independent of NestJS and Prisma.
- The application depends on the domain and internal contracts.
- Infrastructure implements contracts without forcing the application to import concrete classes.
- The presentation layer invokes use cases without containing business logic.
- NestJS module composition performs dependency injection of concrete implementations.

Use NestJS injection tokens and providers when needed.

Do not define tokens exclusively in infrastructure if that forces an inner layer to import an outer layer. Contracts must reside somewhere accessible to the inner layers.

Do not create abstractions without a real justification. The goal is to reduce coupling and improve testability, not to multiply interfaces and classes without purpose.

## 4.6. Applying SOLID principles

Systematically verify:

- **SRP:** each class has cohesive responsibilities and compatible reasons to change.
- **OCP:** new implementations can be added without repeatedly modifying core rules.
- **LSP:** substitute implementations respect the abstraction's contracts and expectations.
- **ISP:** contracts do not force consumers to depend on unnecessary operations.
- **DIP:** high-level rules depend on abstractions, while infrastructure implements them.

Create architectural verification mechanisms using ESLint or a suitable project tool to prevent prohibited imports between layers.

---

# 5. THE 12 MODULES AND THEIR RESPONSIBILITIES

# MODULE 1 — AUTH: AUTHENTICATION, IDENTITY, AND ACCESS CONTROL

Implement or refactor the `AUTH` module, responsible for authentication, identity management, session control, and authorization to access Vitare 2026 resources.

The implementation must apply Clean Architecture, pragmatic Domain-Driven Design (DDD), and SOLID principles, preserving existing functional flows and maintaining compatibility with `apps/web`, `apps/web-staff`, NestJS, Prisma ORM, and PostgreSQL.

The module must integrate with the other contexts through well-defined contracts, without turning authentication into a circular dependency or concentrating in it the rules specific to medical records, emergencies, or staff management.

## 1.1. Mandatory audit of the current state

Before implementing changes, examine:

- The current structure of `apps/api/src/modules/auth/`.
- Controllers, services, repositories, DTOs, guards, strategies, decorators, and tests.
- The user model, role enums, and relationships defined in `schema.prisma`.
- The current JWT generation and validation mechanism.
- Persistence, rotation, and revocation of refresh tokens.
- Patient registration and login flows.
- Staff authentication and provisioning flows.
- Existing OAuth/Google integration and callbacks.
- Password recovery and reset, if implemented.
- NestJS global authentication and authorization mechanisms.
- The HTTP services in both frontends that consume the API.
- Environment and deployment configuration files.
- The caching strategy and Redis configuration to be implemented in the project.

Do not assume that entities, relationships, fields, or flows exist without checking the actual code.

Preserve existing HTTP contracts whenever possible. Any required change to endpoints, payloads, cookies, or responses must be identified and documented.

## 1.2. Identities and roles

The system must recognize the following business roles:

- `PATIENT`
- `MEDIC_STAFF`
- `RESCUER_STAFF`
- `ADMIN`

Inspect existing values and enums before modifying the schema. If the current representation is incompatible, implement a migration that is compatible with existing data, without losing or silently reinterpreting assigned roles.

The authenticated identity must contain the information required to identify the user and determine their effective permissions.

Do not confuse a user's existence with their authorization to access a resource.

### Authorization rules

The module must provide consistent authentication and authorization mechanisms for the other modules.

Minimum requirements:

- A patient may view and modify only resources belonging to them, subject to specific permissions.
- A healthcare professional may access only resources compatible with their role and authorization.
- A rescuer may access only emergencies and clinical information permitted for their duties.
- An administrator has only the administrative privileges defined by system policies.
- An ordinary user cannot change their own role through a DTO, parameter, or arbitrary payload.
- A valid token does not grant unrestricted authorization.
- Knowing a UUID, CPF, or resource identifier does not grant access to the corresponding medical record.

Implement authorization by role as well as by resource, owner, and operational context when needed.

Use NestJS guards, decorators, and policies as integration mechanisms, keeping core rules in contracts and components appropriate to the architecture.

Do not enforce authorization exclusively in the user interface.

## 1.3. Secure registration and provisioning

Differentiate patient registration from staff provisioning.

### Patient registration

Preserve the current patient registration flow, applying validation, data normalization, duplicate prevention, and existing business rules.

The user's role must be assigned by the server, without relying on a free-form field submitted by the client.

### Staff registration

Do not keep a public endpoint that allows any visitor to create a privileged staff account.

Implement or preserve a secure provisioning flow, such as a validated invitation, administrator-authorized creation, or controlled initial bootstrap process.

The administrator bootstrap process must:

- Be explicitly controlled.
- Prevent concurrent creation of initial administrators in a way that conflicts with system policy.
- Not use default passwords.
- Not remain accessible as an unrestricted administrator-creation mechanism.
- Be documented for configuring new environments.

The staff role must be defined and validated by the server, according to the authorized provisioning mechanism.

If legacy staff accounts exist, preserve the accounts and migrate the flows compatibly, without automatically granting privileged access.

## 1.4. Passwords and local authentication

Use bcrypt with asynchronous hashing and comparison operations:

- `bcrypt.hash()`
- `bcrypt.compare()`

Do not use the synchronous variants in request-handling paths.

Configure the cost factor through a validated environment variable and document the procedure for adjusting this value using measurements in the runtime environment.

Respect bcrypt's 72-byte input limit. Explicitly validate password length, without silent truncation or normalization that unexpectedly changes the credential.

The policy must include:

- An appropriate minimum length.
- A maximum length that respects the capacity of the algorithm being used.
- Rejection of invalid credentials.
- Error messages that do not facilitate account enumeration.
- Rate limiting for login and recovery flows.
- No passwords in logs, exceptions, metrics, or responses.
- A migration strategy for old hashes, if any exist.

Do not change persisted hashes or force mass password resets without analyzing compatibility with existing accounts.

## 1.5. JWTs, access tokens, and refresh tokens

Implement or fix:

- Access-token generation.
- Cryptographic validation.
- Expiration.
- Separation between access tokens and refresh tokens.
- Validation of required claims.
- Session identification when applicable.
- Secure refresh-token rotation.
- Revocation and logout.
- Revocation by user and session.
- Handling of token reuse.
- An invalidation policy after critical credential or privilege changes.

Validate `issuer` and `audience` when they are configured in the application's contract. Use explicitly permitted signing algorithms; do not blindly trust the algorithm declared by the received token.

Consider storing persisted refresh tokens as hashes, or using another mechanism that avoids keeping reusable credentials in plaintext in the database.

### Rotation concurrency

Rotation must prevent two simultaneous requests from using the same refresh token to obtain independent sessions when the policy requires single use.

Use a transaction and a conditional token-consumption or update operation, ensuring that only one valid request can complete the rotation.

If a token that has already been consumed is reused, apply the defined security policy to revoke or invalidate the related token family, according to the persisted session data.

Use Redis only as a complementary coordination and acceleration mechanism. Persistent session integrity and reuse prevention must not depend exclusively on a temporary Redis key.

## 1.6. Credential storage on the client

Audit the current token-storage mechanisms in both frontends.

Evaluate the use of `HttpOnly`, `Secure`, and `SameSite` cookies, or a BFF pattern when compatible with the infrastructure and project requirements. If authenticated cookies are used, implement appropriate CSRF protection.

Do not silently change the authentication mechanism in a way that leaves the frontends unable to authenticate or breaks Google OAuth flows.

Because Vitare has PWA and offline-operation requirements, distinguish between:

- Identity confirmed by the server.
- The currently authenticated session.
- Previously synchronized data available offline.
- Local operations pending synchronization.

The availability of information in IndexedDB must not be interpreted as proof that the session is still authenticated.

## 1.7. OAuth/Google

Preserve the existing OAuth/Google flow.

Verify:

- The validity of the OAuth transaction state.
- Callback validation.
- Correct association of the external identity with a local account.
- Prevention of improper linking to existing accounts.
- Handling of failures and cancellations.
- Compatibility with production and development domains.
- The token-issuance policy after completion of the flow.
- Absence of secrets and tokens in logs and URLs accessible to the user.

Do not invent callback URLs or change the domains registered with providers without considering the actual deployment configuration.

## 1.8. Password recovery and reset

If these flows already exist, preserve them and fix their inconsistencies.

The mechanism must:

- Use random, single-use recovery tokens.
- Store only the information required to validate the token securely.
- Establish an expiration period.
- Prevent reuse after consumption.
- Avoid account enumeration.
- Revoke or invalidate sessions according to the defined policy.
- Ensure transactional consistency between changing the password and consuming the token.

Do not use `Promise.all` as a substitute for a transaction for operations that must be atomic.

## 1.9. Internal architecture

**Domain**

- Identity and session lifecycle rules, when justified.
- Value Objects for identity concepts.
- Business rules independent of the JWT mechanism.
- Domain authentication and authorization exceptions, where applicable.

**Application**

- Use cases for registration, login, rotation, logout, recovery, and provisioning.
- Repository contracts.
- Ports for hashing, token issuance or validation, and required services.

**Infrastructure**

- bcrypt adapters.
- JWT adapters.
- Prisma persistence.
- OAuth/Google integration.
- Redis mechanisms required for sessions or coordination.
- External email-sending services, if they already exist.

**Presentation**

- Controllers.
- DTOs.
- Guards.
- Strategies.
- Decorators.
- Input validation and conversion of errors to HTTP responses.

Core logic must not depend on concrete implementations of Prisma, Redis, or NestJS.

## 1.10. Tests and acceptance criteria

Implement or fix unit, integration, and E2E tests for:

- Authorized patient registration.
- Secure staff provisioning.
- Rejection of improper role changes.
- Asynchronous password hashing and comparison.
- Valid and invalid login.
- Expired or invalid JWTs, or JWTs with incompatible claims.
- Valid, expired, revoked, and reused refresh tokens.
- Two simultaneous rotations of the same token.
- Logout and session invalidation.
- Password recovery and single-use consumption of the token.
- Authorization by role and resource.
- The OAuth/Google flow when the environment permits it.
- Rejection of medical-record access by unauthorized users.

Do not declare authentication secure merely because login works. Validation must include explicit attempts at unauthorized access.

---

# MODULE 2 — PATIENTS: DEMOGRAPHIC MANAGEMENT AND MEDICAL-RECORD COORDINATION

Implement or refactor the `PATIENTS` module, responsible for the demographic profile, basic clinical identity, and coordination of read access to electronic medical-record information.

The application must use Clean Architecture, pragmatic DDD, and SOLID principles, keeping the patient domain independent of the concrete implementations of clinical modules and persistence.

This module is responsible for coordinating information. It must not indiscriminately absorb the internal rules of medications, allergies, conditions, contacts, and emergencies.

## 2.1. Mandatory audit

Examine:

- The structure of `apps/api/src/modules/patients/`.
- Existing Prisma entities and models.
- Relationships with users and clinical data.
- DTOs and HTTP contracts.
- Current ownership and authorization rules.
- How medications, allergies, conditions, and contacts are retrieved.
- Profile-update operations.
- Normalization mechanisms for CPF, email, telephone, and other identifiers.
- PostgreSQL indexes and constraints.
- Frontend components that consume the profile and medical record.

Preserve existing data, useful contracts, and implemented behavior. Do not create new tables for information that is already adequately represented.

## 2.2. Responsibilities

The module must provide:

- Patient-profile registration or initialization according to the current flow.
- Retrieval of the user's own profile.
- Administrative or professional retrieval when authorized.
- Updating permitted demographic fields.
- Validation of consistency between the authenticated account and the profile.
- Composite medical-record queries through contracts of the clinical modules.
- Read projections for the frontends.
- Retrieval of data relevant to the emergency context, respecting the rules defined by the `EMERGENCY` module.
- List pagination, where applicable.
- Auditable recording of sensitive changes, if included in the system's audit model.

## 2.3. Separation of identity, profile, and medical record

Distinguish the following concepts, according to the current model:

- Identity and authentication credentials.
- The patient's demographic profile.
- Individual clinical records.
- Aggregated read projections.
- A historical emergency snapshot.

The `AUTH` module controls identity and authentication. The `PATIENTS` module manages the profile and coordinates clinical queries, but must not take ownership of all clinical tables.

Do not allow a demographic update to accidentally change medications, allergies, or conditions.

A composite medical-record read may combine data from other modules through application contracts, dedicated queries, or a read projection. Choose the mechanism best suited to the current state of the code without introducing circular dependencies.

## 2.4. Partial updates and integrity

Clearly define which fields patients may change themselves and which require privileges or specific workflows.

A partial update must not turn omitted fields into `null`, overwrite protected data, or allow the profile owner to be changed.

Use DTOs with whitelisting, validation, and transformation, preserving the project's global validation mechanisms.

Identifier normalization must be consistent. In particular, prevent a formatted CPF at registration from differing from the value used in queries or associations.

If CPF is a unique identifier, confirm the rule in the schema and use the established canonical format. Do not consider syntactic normalization sufficient to prove that a document belongs to a person.

## 2.5. DDD and domain rules

Model a concept as an entity when it has its own identity and lifecycle, according to the project's rules.

Use Value Objects only when they help protect invariants or standardize concepts such as email, CPF, and telephone number.

Do not turn the entire demographic profile into an artificial class with dozens of trivial methods.

Update and ownership rules must be explicit. The domain entity must not import Prisma types or NestJS classes.

## 2.6. Composite medical record and integration with submodules

Create or refactor a dedicated use case for composite medical-record queries when this functionality exists in the current contract.

The result should include only the data required, for example:

- Demographic profile.
- Active medications.
- Allergies.
- Chronic conditions.
- Emergency contacts.
- Applicable medication restrictions, according to the permissions and purpose of the query.

Use the contracts of the corresponding modules and preserve the semantics of each source.

Do not automatically expose all data to every consumer. The projection must vary according to the requester's purpose and authorization.

When an optimized read query is required, implement it as an application query model. This does not require turning the entire medical record into a single DDD aggregate.

Avoid N+1 queries and redundant calls. If parallel queries are used, assess whether they could produce an inconsistent representation under concurrent changes.

## 2.7. Security and privacy

All operations must verify the authenticated user and the resource scope.

Implement policies that prevent:

- Improper access to third parties' profiles.
- Changes to the owner's identifier.
- Unnecessary exposure of demographic data.
- Unrestricted listing of patients.
- Queries by predictable identifiers without authorization.
- Returning internal fields without a need.

Avoid logging complete medical records.

Professional queries must respect role-based authorization and the operational context, including the policies defined for emergency care.

## 2.8. Caching and consistency

Use Redis only for queries whose caching policy is clearly defined.

Do not use a generic profile cache that could improperly share data between patients.

If clinical projections are cached, the key must account for the appropriate identity and authorization scope, and the invalidation policy must reflect changes in dependent modules.

Persisted PostgreSQL data remains the source of truth.

Do not present a stored projection as necessarily current unless it includes update information or follows an appropriate validity policy.

## 2.9. Internal architecture

**Domain**

- Profile entity or aggregate, as required.
- Useful Value Objects.
- Update rules and invariants.

**Application**

- Use cases for creation, retrieval, updating, and composite reads.
- Ports for repositories and query services.
- Orchestration of medical-record projections.

**Infrastructure**

- Prisma implementations.
- Mappers.
- Required read queries and adapters.

**Presentation**

- Controllers.
- DTOs.
- Guards.
- HTTP transformation and validation.

Use cases must not query Prisma directly. Do not allow the `PATIENTS` module to take control of other modules' internal rules merely because it centralizes medical-record reading.

## 2.10. Tests and acceptance criteria

Implement or fix tests for:

- Profile creation and retrieval.
- Correct partial updates.
- Preservation of omitted fields.
- Rejection of changes to protected fields.
- Identifier normalization and lookup.
- Authorization and isolation between patients.
- Composite medical-record queries.
- Failure of a dependent submodule.
- Prevention of N+1 queries in critical queries, where verifiable.
- Compatibility with frontend contracts.
- Integrity of the relationship with the authenticated identity.

The result must allow demographic and clinical information to evolve independently while maintaining a consistent query experience.

---

## MODULE 3 — MEDICATIONS: MANAGEMENT OF THE PATIENT'S ACTIVE MEDICATIONS

Implement or refactor the `MEDICATIONS` module, applying Clean Architecture, Domain-Driven Design (DDD), and SOLID principles while preserving the contracts, features, and data already present in the Vitare 2026 project.

This module is exclusively responsible for managing medications associated with the patient's individual medical record. It must maintain a consistent relationship with the `MEDICATIONS-DICTIONARY` module, which provides the master medication catalog already present in the project.

### 3.1. Mandatory audit before implementation

Before modifying the module, examine:

- The current structure of `apps/api/src/modules/medications/`.
- Existing controllers, services, repositories, DTOs, domain models, and tests.
- The medication model defined in `schema.prisma`.
- Existing relationships between active medications and patients.
- Fields used to represent dosage, frequency, dates, and usage status.
- Reference JSON files located in `prisma/data/` that contain medication-catalog data.
- `prisma/seed.ts` or the `seed.ts` file actually used by the project, verifying how dictionary records are imported into PostgreSQL.
- HTTP contracts consumed by `apps/web`.
- The `FORBIDDEN-MEDICATIONS` module, to preserve compatibility with existing medication-restriction rules.

Do not assume JSON filenames, fields, enums, or relationships without checking their actual definitions in the repository.

Do not create another master catalog, another import file, or a second seed mechanism to solve problems that can be fixed in the existing mechanism.

### 3.2. Functional responsibilities

The module must provide operations to:

- Add a medication to the patient's medical record.
- Retrieve a patient's active medications.
- Retrieve details of a medication associated with the medical record.
- Update dosage, frequency, and other permitted information.
- Record the start of use and, where applicable, the end date.
- Mark a medication as inactive or discontinued, respecting the current model.
- Retrieve usage history, if it is already within the scope and existing persistence structure.
- Check medication compatibility with medical restrictions recorded in the system.
- Correctly associate each record with the patient and the corresponding medication in the master catalog.

Preserve the existing business model. If a required field does not exist, justify the change, update the schema, and create a migration compatible with already-persisted data.

### 3.3. Mandatory relationship with MEDICATIONS-DICTIONARY

The `MEDICATIONS` module must not maintain an independent copy of the master catalog.

Each medication registered in the medical record must reference, where applicable, the corresponding record in `MEDICATIONS-DICTIONARY`, using the persistent identifier or reference key established by the project's actual schema.

The flow must work as follows:

1. The client selects a medication available in the catalog.
2. The API validates the received identifier and verifies that the reference record exists and is available for association.
3. The use case validates patient-specific data, such as dosage and frequency.
4. The system checks the applicable clinical restrictions.
5. The repository persists the association and the treatment-specific data.
6. The response contains the representation required by the frontend, without unnecessarily duplicating all immutable catalog attributes.

The reference catalog must remain the source of shared medication attributes. Usage data, such as prescribed or reported dosage, frequency, and usage status, belongs to the patient's specific record.

Do not confuse the cataloged medication with the patient's individual treatment: they are distinct domain concepts.

### 3.4. Preserve the frequency model

Keep `frequency` to represent medication-use periodicity, in accordance with the architectural decision already established in the project.

**Do not recreate the `schedules` module or entity, and do not reintroduce relationships or tables that were previously removed.**

Examine the current `frequency` format and preserve its semantics. If the format needs greater standardization, propose a representation compatible with existing data and implement the required migration without discarding information.

Do not invent frequencies, dosages, or therapeutic instructions.

### 3.5. Medication-restriction checks

Integrate the module with the existing `FORBIDDEN-MEDICATIONS` and `ALLERGIES` mechanisms, respecting the internal contracts of these features.

Before persisting an addition or change that could violate a blocking rule, the use case must check the restrictions applicable to the patient.

When there is a conflict with a restriction formally defined as blocking:

- The operation must be stopped.
- No partially invalid record may be persisted.
- The use case must return a typed domain error.
- The API must translate that error into a consistent HTTP response.
- The response must not unnecessarily expose sensitive clinical information.

Validation must take place in the backend and must not depend exclusively on the interface.

Use canonical identifiers and existing reference relationships to compare medications and active ingredients. Do not rely exclusively on textual name comparison or assume pharmacological equivalence when it is not represented by reliable data.

If a restriction can be updated concurrently with the addition of a medication, implement an appropriate transactional strategy and tests to validate the behavior.

Do not invent clinical drug-interaction rules. Clearly distinguish restrictions actually registered in the project from potential future features that depend on an additional validated dataset.

### 3.6. Caching and performance

Use the application's shared Redis cache for read operations that genuinely benefit from it.

The `MEDICATIONS` module must use `MEDICATIONS-DICTIONARY` as its reference source and take advantage of that module's cache, avoiding a second, competing catalog-cache mechanism.

Do not indiscriminately store individual medical records in the catalog cache.

If caching of patient-specific information is introduced, establish a separate policy that considers authorization, per-user isolation, invalidation, and exposure of clinical data.

Use efficient Prisma queries, explicit projections, appropriate indexes, and pagination when justified by result volume.

Avoid N+1 queries and repeated linear searches inside loops.

### 3.7. Internal architecture

Structure the module according to its actual responsibilities:

**Domain**

- Entities or aggregates required to represent medication use.
- Relevant Value Objects.
- Treatment-consistency rules.
- Domain exceptions.

**Application**

- Use cases for addition, retrieval, updating, and discontinuation.
- Internal repository contracts.
- Coordination with clinical-restriction checks.

**Infrastructure**

- Concrete Prisma persistence implementations.
- Mappers between persisted records and application or domain models.

**Presentation**

- Controllers.
- DTOs.
- HTTP input validation.
- Conversion of errors into appropriate responses.

Do not allow the domain entity to depend on the Prisma client or NestJS components.

### 3.8. Tests and acceptance criteria

Implement or fix unit, integration, and E2E tests that verify:

- Valid medication addition.
- Association with a valid `MEDICATIONS-DICTIONARY` record.
- Rejection of nonexistent catalog identifiers.
- Frequency updates without information loss.
- Retrieval of active medications.
- Discontinuation according to the domain.
- Blocking of formally prohibited medications.
- No partial persistence for blocked operations.
- Respect for patient authorization.
- Compatibility with the current seed and schema.
- No duplication of master-catalog data.

Do not declare the module complete merely because the code compiles. Run the available tests and record any limitations.

---

## MODULE 4 — MEDICATIONS-DICTIONARY: MASTER MEDICATION CATALOG

Implement or refactor the `MEDICATIONS-DICTIONARY` module, responsible for providing the medication and active-ingredient catalog used by Vitare.

**The reference data already exists in the project, in `.json` files inside `prisma/data/`, and the loading mechanism already exists through `seed.ts`. The task is to preserve, reuse, validate, and optimize this infrastructure, not replace it with an external source or a redundant new import process.**

### 4.1. Existing data source — mandatory requirement

Before implementing changes, actually inspect:

- All relevant JSON files in `prisma/data/`.
- The structure and properties of each dataset.
- The identifiers and keys used.
- Relationships between medications, active ingredients, and other cataloged information.
- The corresponding Prisma schema.
- The `seed.ts` file that populates PostgreSQL.
- The seed execution commands defined in the project.
- The current insertion, update, and duplicate-prevention strategy.
- Existing uniqueness constraints and indexes.

Use the data present in the repository as the source for the refactoring and preserve the provenance of those files.

Do not replace the existing dataset with an external API, perform unnecessary downloads, or assume that importing new Anvisa data is mandatory to complete this task.

Do not arbitrarily modify, reduce, or reconstruct the contents of JSON files to simplify processing. If you identify inconsistent records, missing fields, or integrity problems, document the diagnosis and fix the import mechanism compatibly with the actual data.

Adding new regulatory datasets in the future must be a separate decision based on explicit requirements and verified sources.

### 4.2. Separation between the loading source and the query source

Clearly establish the role of each component:

- **JSON files in `prisma/data/`:** reference sources used by the existing loading process.
- **`seed.ts`:** mechanism responsible for loading or synchronizing reference data with PostgreSQL, according to the project's actual behavior.
- **PostgreSQL:** persistent source queried by the application at runtime.
- **Redis:** cache layer used to reduce repeated queries to PostgreSQL.
- **MEDICATIONS:** consumer module that associates catalog records with patients' individual treatments.

Do not indiscriminately load JSON files on every HTTP request.

The running API must query the catalog through application contracts and persistence implementations, using Redis according to the defined cache policy.

The seed must remain the official mechanism for loading existing datasets, without duplicating logic across multiple modules.

### 4.3. Seed and data integrity

Review the current `seed.ts` and correct it only when necessary to meet the requirements.

Seed execution must be reproducible and, when compatible with the model, idempotent: running it again must not create duplicate reference records.

Use real, stable unique keys found in the files and schema. Do not choose fields such as name or description as unique identifiers without verifying that this property is guaranteed by the source.

Where applicable, use operations such as `upsert` with a persistent unique key.

Preserve existing records and relationships. Do not automatically delete records that no longer appear in a load unless there is an explicit policy for removing, deactivating, or updating the catalog.

The process must:

- Validate the structure of input data.
- Identify invalid records.
- Log import errors without exposing sensitive information.
- Avoid broken associations.
- Respect PostgreSQL constraints.
- Report the number of records processed, inserted, updated, and rejected.
- Allow integrity to be verified after loading.

Do not change the seed to mask schema or data errors.

### 4.4. Contracts and domain model

Refactor the module using Clean Architecture, pragmatic DDD, and SOLID.

Separate the catalog representation from concrete persistence mechanisms.

The domain must not depend on Prisma-generated types.

Define appropriate contracts for reference queries, with operations compatible with the structure of the existing data.

Conceptual examples of operations:

- Find a medication by identifier.
- Search by official code or another existing key.
- Query active ingredients.
- Search by name or synonym, when supported by the source.
- Retrieve paginated results for search interfaces.

These examples do not authorize creating fields or relationships that do not exist. Adapt the contracts to the actual schema.

The Prisma repository must map persisted records to the models consumed by the application.

Ordinary catalog operations must be read-only. Data updates must occur through the seed process or an existing controlled administrative flow, without allowing a patient to change the master catalog.

### 4.5. Cache-Aside with Redis and a 24-hour TTL

Implement a Cache-Aside strategy using the project's shared Redis adapter.

The flow for eligible queries must be:

1. Receive the identifier or normalized query parameters.
2. Build a cache key with a namespace and schema version.
3. Query Redis.
4. If a valid value compatible with the contract exists, return it.
5. On a cache miss, query PostgreSQL.
6. Serialize and store the result in the established format.
7. Apply a TTL of 86,400 seconds to cached records.
8. Return the result to the consumer.

Define keys that do not conflict across environments or query types. For example, use a convention equivalent to:

`vitare:{environment}:v1:medication-dictionary:id:{id}`

Adapt the naming to the technical pattern chosen for the implementation.

Do not allow invalid identifiers, unnormalized inputs, or different query types to collide under the same key.

### 4.6. Cache invalidation and synchronization

The cache must respect updates to persisted data.

After a successful catalog load or update:

- Invalidate affected entries or use a namespace-versioning mechanism.
- Avoid leaving old records available for 24 hours after an update that requires immediate propagation.
- Handle invalidation failures observably.
- Do not mark an update as fully complete if the consistency policy requires invalidation that has not yet been performed.

If catalog versioning is used, document how the seed process updates the version and how application instances begin using the new dataset.

The 24-hour TTL is the normal lifetime limit for cached records, not a justification for ignoring explicit updates.

### 4.7. Algorithmic efficiency

Optimize operations based on the identifiers and queries that actually exist in the JSON files and schema.

For direct queries by identifier or unique key, use Redis and PostgreSQL indexes appropriately.

For searches that require joining medications and active ingredients in memory, build associative indexes with `Map` and avoid repeatedly locating the same record in large arrays.

Do not claim that all search operations are O(1). Substring queries, sorting, filtering across multiple fields, and pagination have different costs.

Consider:

- Database indexes for keys used in queries.
- `Map` for repeated in-memory joins.
- Caching by identifier or frequently used query.
- Page-size limits.
- Search-result caching only when the combination of filters and invalidation policy are clearly defined.

Do not load the entire catalog for every request. If a complete in-memory index is required, build it once per instance, size its memory consumption appropriately, and provide an explicit update strategy.

### 4.8. Redis resilience

Implement handling for cache misses, timeouts, invalid values, unavailable connections, and serialization failures.

For reference queries, PostgreSQL may serve as a fallback when Redis is unavailable, provided the behavior is safe and timeouts are bounded.

Avoid infinite retry loops and database-query stampedes.

Cache failures must be observable, without including payloads or sensitive data in logs.

### 4.9. Tests and acceptance criteria

Implement or fix tests for:

- Compatibility with the actual schema of the JSON files.
- Repeated seed execution without improper duplication.
- Integrity of persisted relationships.
- Lookup by identifier.
- Lookup by an actually existing code or reference key.
- Cache miss followed by persistence in Redis.
- Cache hit without a redundant PostgreSQL query.
- Expiration after the TTL.
- Invalidation after catalog updates.
- Controlled fallback when Redis is unavailable.
- Behavior when inconsistent records are encountered during loading.

Do not invent official data for tests. Artificial fixtures must be explicitly identified and used only to test behavior.

Do not declare the module complete without evidence that the relevant tests have been run.

---

# MODULE 5 — ALLERGIES: ALLERGIES AND ALLERGIC RESTRICTIONS

Implement or refactor the `ALLERGIES` module, responsible for recording, retrieving, updating, and managing allergies associated with a patient.

The module must apply Clean Architecture, pragmatic DDD, and SOLID principles, remaining compatible with the Prisma schema, PostgreSQL, existing contracts, and the other clinical modules.

## 5.1. Mandatory audit

Examine:

- The structure of `apps/api/src/modules/allergies/`.
- Controllers, services, repositories, DTOs, and tests.
- Prisma models and related migrations.
- Existing allergy types and severity fields.
- Relationships with patients, medications, or active ingredients, where present.
- Integration with `PATIENTS`, `MEDICATIONS`, and `FORBIDDEN-MEDICATIONS`.
- Fields actually used by the frontend.
- Deletion or deactivation rules.
- How allergies are included in the emergency snapshot.

Do not assume the current model contains every field mentioned in this prompt. If a required field does not exist, justify the change and preserve existing records through a compatible migration.

## 5.2. Responsibilities

The module must manage:

- Allergy registration.
- Retrieval of a patient's allergies.
- Updating authorized records.
- Removal or deactivation according to the existing policy.
- Type or category.
- Related agent or substance.
- Reported reaction, when available.
- Severity, if included in the model.
- Notes compatible with the system's purpose.
- The current information status.
- A reference to a medication or active ingredient, where applicable.

Distinguish an allergy from a preference, an unconfirmed adverse effect, and an administrative contraindication. If these concepts are part of the domain, do not represent them as equivalent.

Do not invent clinical classifications absent from the model or assume that a free-text field is sufficient to identify an active ingredient unambiguously.

## 5.3. Integration with MEDICATIONS and MEDICATIONS-DICTIONARY

When an allergy is related to a medication or active ingredient, use the canonical references available in the model.

The integration must allow `MEDICATIONS` to query the information required for compatibility checks.

Do not make `ALLERGIES` depend directly on a concrete Prisma implementation used by the medications module.

Define an internal contract to query allergy-related restrictions applicable to a patient when that operation is required.

The catalog module remains responsible for reference data, while `ALLERGIES` maintains individual information associated with the patient.

Do not duplicate the medication catalog in allergy tables.

Do not infer equivalence between substance names without an explicit, validated relationship.

## 5.4. Domain rules

Implement the rules required to ensure:

- A valid association with the patient.
- Consistent identification of the allergy type.
- Integrity of medication and substance references.
- Explicit rules for updating, deactivating, and deleting.
- Preservation of information required for history.
- No accidental changes to other patients' clinical records.

When an allergy is changed, consider the project's defined audit policy.

If the operation affects the safety of an active medication, record the information and allow the responsible use case to query the updated restrictions. Do not implement automatic treatment changes without an explicitly approved business rule.

The system must distinguish recording an allergy from deciding to block a medication. The blocking policy must be integrated into the module that actually checks restrictions, preserving a clear source for each rule.

## 5.5. Security and authorization

Patients must be able to view and manage only their own allergies, subject to the established permissions.

Professionals must access information according to their roles and operational authorization.

Protect endpoints against access by third-party identifiers and do not return unnecessary clinical notes.

When a professional queries allergy information during care, apply the authorization policies of the `AUTH` module and, when relevant, the access context of `EMERGENCY` and `STAFF`.

Do not enforce authorization only in the interface.

## 5.6. Persistence and consistency

Use PostgreSQL as the persistent source.

The integrity of associations must be maintained through appropriate Prisma and database relationships and constraints.

If individual information is cached, explicitly define the key's scope and the invalidation policy.

Do not store every user's entire set of allergies under a single Redis key accessible through non-isolated queries.

For highly relevant clinical information, do not allow an old cache entry to be used as the current source without respecting the defined consistency policy.

## 5.7. Clinical snapshot

When allergies are part of the emergency Clinical Snapshot, the module must provide the required representation through an internal query contract.

The snapshot must preserve the data corresponding to the capture time, according to the `EMERGENCY` policy.

A subsequent allergy update must not silently modify an already-persisted historical snapshot.

Where applicable, capture must distinguish information already present on the server from data submitted offline.

## 5.8. Internal architecture

**Domain**

- Required entities and Value Objects.
- State and consistency rules.
- Domain exceptions.

**Application**

- Use cases for creation, retrieval, updating, and deactivation.
- Contracts for querying allergy-related restrictions.
- Coordination with the clinical profile.

**Infrastructure**

- Prisma repositories.
- Mappers.
- Persistence adapters.

**Presentation**

- Controllers.
- DTOs.
- Guards and HTTP validation.

Do not allow the domain to import NestJS, Prisma, or Redis.

## 5.9. Tests and acceptance criteria

Implement unit, integration, and E2E tests for:

- Allergy registration and retrieval.
- Updating and deactivation.
- Association with the correct patient.
- Rejection of invalid data.
- Integration with medication references.
- Querying restrictions by the `MEDICATIONS` module.
- Authorization and isolation between patients.
- Persistence and referential integrity.
- Inclusion in the clinical snapshot.
- Preservation of historical snapshots.
- Persistence failures and absence of partial changes.

Do not consider the module complete merely because the API allows records to be created and listed. Clinical integration, authorization rules, and historical consistency must also be tested.

---

## MODULE 6 — CONDITIONS: MANAGEMENT OF THE PATIENT'S CHRONIC CONDITIONS

Implement or refactor the `CONDITIONS` module, responsible for recording long-term health conditions associated with the patient's medical record.

This module must use the `DISEASE-DICTIONARY` catalog, which already has local data sources in the project under `prisma/data/`, and an existing loading mechanism through `seed.ts`.

**Do not create a second disease catalog inside `CONDITIONS` and do not duplicate dictionary records in the entity that represents an individual patient's condition.**

### 6.1. Audit of the existing model

Before modifying the code, examine:

- The structure of `apps/api/src/modules/conditions/`.
- Existing controllers, services, repositories, DTOs, and tests.
- The Prisma model used for conditions and its relationships with patients.
- Existing status, date, and notes fields.
- Disease and condition JSON files in `prisma/data/`.
- The `seed.ts` responsible for loading reference data.
- The schema of the `DISEASE-DICTIONARY` module.
- Contracts used by the frontend.
- The current emergency-snapshot mechanism, if conditions are part of the captured data.

Use the project's actual structures. Do not create new field names, enums, or relationships without a demonstrated technical need.

### 6.2. Functional responsibilities

The module must allow the application to:

- Associate a cataloged condition with a patient.
- Retrieve conditions recorded in the medical record.
- Update permitted information about the association.
- Identify active and inactive conditions, if those states are compatible with the existing domain.
- Record dates and notes where provided by the model.
- End or deactivate an association according to the defined rules.
- Retrieve conditions relevant to assembling the clinical profile.
- Expose the data required for the emergency snapshot, according to its capture policy.

An individual condition must not modify the master catalog.

For example, updating a patient's notes must not change the disease description or official code shared by all users.

### 6.3. Relationship with DISEASE-DICTIONARY

The association between a patient's clinical condition and the dictionary must use the persistent identifier or reference key established by the existing schema.

The creation flow must:

1. Receive the authorized association data.
2. Validate the patient's identity and ownership.
3. Validate that the record exists in `DISEASE-DICTIONARY`.
4. Check the duplication and state rules defined by the domain.
5. Persist the association through the repository.
6. Return a representation appropriate for the frontend.

The individual clinical record must retain only the attributes that actually belong to the association with the patient.

Do not unnecessarily duplicate the catalog code and description in the clinical record. If a historical requirement justifies preserving classification data as of the diagnosis date, model that need explicitly instead of turning an informal copy into a second reference source.

If the current model uses a direct association by identifier, preserve it when architecturally compatible.

### 6.4. Internal architecture

Apply Clean Architecture, DDD, and SOLID.

**Domain**

- Entity or aggregate representing the association between a condition and a patient, where necessary.
- State rules and invariants.
- Domain exceptions.

**Application**

- Use cases for creation, retrieval, updating, and closure.
- Internal persistence contracts.
- Validation of the catalog association through an appropriate abstraction.

**Infrastructure**

- Prisma repository implementation.
- Mapping between persisted data and application models.
- Access to the `DISEASE-DICTIONARY` query contracts.

**Presentation**

- Controllers.
- DTOs.
- Input validation.
- Conversion of results to the existing HTTP contracts.

The `CONDITIONS` module must not import the Prisma client directly to query the dictionary from a use case.

Association validation must take place in the appropriate application layer and, where applicable, be supported by relational integrity in PostgreSQL.

Do not create circular dependencies between `CONDITIONS` and `DISEASE-DICTIONARY`.

### 6.5. Caching and efficiency

Catalog access must reuse the Redis strategy implemented by `DISEASE-DICTIONARY`.

Do not implement a separate cache in `CONDITIONS` for the same codes and records.

For condition queries by patient:

- Use indexes appropriate for the existing relationships and filters.
- Avoid N+1 queries.
- Explicitly project the required data.
- Use pagination when justified by volume.
- Do not repeatedly query the same reference data inside loops.

If several clinical records must be correlated with dictionary records in memory, use a `Map` indexed by the persistent key.

This optimization does not eliminate the need to validate database integrity. The relationship between the clinical record and the catalog must remain consistent even if the cache is empty or unavailable.

### 6.6. Compatibility with the existing seed

The reference catalog must be loaded by the mechanism already implemented in `seed.ts`, using JSON files in `prisma/data/`.

The `CONDITIONS` module must not:

- Reimport JSON at every startup.
- Implement a second seed.
- Create duplicate dictionary records.
- Update catalog descriptions through individual patient operations.
- Invent codes or descriptions to fill missing fields.

If the audit detects a discrepancy between the seed, JSON files, and Prisma schema, fix the official loading process, with migrations and tests, without creating a parallel implementation.

### 6.7. Compatibility with the clinical snapshot

When conditions are included in the emergency clinical snapshot, the responsible use case must use the appropriate read model, preserving the capture rules and provenance defined by the `EMERGENCY` module.

The snapshot must reflect the relevant data at the time it was created, according to the established policy.

Do not modify historical snapshots when the patient's condition is subsequently updated.

Updating the medical record and preserving the emergency history are distinct responsibilities.

### 6.8. Tests and acceptance criteria

Implement or fix tests that verify:

- Association of an existing condition with the correct patient.
- Rejection of nonexistent references.
- Updating individual information without changing the master dictionary.
- Queries filtered by patient.
- Behavior of active and inactive states, according to the domain.
- Respect for authorization.
- Relational integrity.
- Compatibility with the actual schema and seed.
- Correct inclusion of conditions in the snapshot, where applicable.
- Preservation of historical snapshots after subsequent medical-record changes.

Do not claim coverage without running the corresponding tests.

---

## MODULE 7 — DISEASE-DICTIONARY: MASTER DISEASE CATALOG AND ICD-10 REFERENCES

Implement or refactor the `DISEASE-DICTIONARY` module, responsible for providing the reference diseases and classifications used by Vitare.

**The data source already exists in the project: the `.json` files in `prisma/data/` and the `seed.ts` mechanism responsible for populating the database. The refactoring must reuse this structure without replacing it with a new catalog, an external API, or another independent import process.**

### 7.1. Mandatory inventory of existing data

Examine the existing JSON files before modifying the module.

Identify:

- The actual filenames and formats.
- Existing codes and identifiers.
- Descriptions.
- Groups and classifications, when available.
- Hierarchical relationships, if any.
- The documented origin of the data.
- The corresponding Prisma model.
- The seed responsible for importing it.
- Existing indexes and constraints.
- Current backend and frontend query patterns.

Do not assume that all available data necessarily represents the complete ICD-10, or that the files contain version or validity-status fields if those fields are absent.

If the official source or catalog coverage is undocumented, record this limitation instead of claiming that all data represents a complete official classification.

Do not download another catalog to replace the existing files.

### 7.2. Data source and loading process

Maintain the separation between:

- JSON files in `prisma/data/`, used as the loading source.
- `seed.ts`, which populates PostgreSQL.
- PostgreSQL, the persistent source queried while the API is running.
- Redis, responsible for caching reference queries.
- `CONDITIONS`, which uses the dictionary to associate concepts with patients' conditions.

The query module must not depend on continuously reading JSON files.

Normal API startup must not indiscriminately load the entire catalog on every request or restart.

Data loading and updating must follow the project's official command. Required automation must be incorporated into the existing seed without duplicating responsibilities.

### 7.3. Seed and catalog consistency

Review the seed to ensure, according to the actual data structure:

- Reproducible importing.
- Explicit handling of unique keys.
- No duplication after repeated runs.
- Consistent relationships.
- Detection of invalid records.
- Accounting of the loading results.
- Compatibility with the schema and migrations.

Use the catalog's actually stable identifier as the reference key.

If the classification code is unique in both the source and the model, use it with an appropriate constraint and index.

Do not automatically use a description as a unique key: similar descriptions, different codes, or presentation variations may exist in the actual data.

Do not delete records merely because they no longer appear in an updated file. Any removal or deactivation must follow an explicit synchronization policy and preserve existing relationships to clinical conditions.

### 7.4. Contracts and internal organization

Apply Clean Architecture, pragmatic DDD, and SOLID principles.

The catalog must have internal contracts for operations such as:

- Lookup by identifier.
- Lookup by classification code.
- Text search, if supported.
- Retrieval of reference information.
- Paginated listing, when required.

Adapt the methods to the actual model.

The domain and application must not depend on Prisma-generated models.

Implement a Prisma adapter that converts persistence records into the read models used by the application.

The catalog must be treated as a read-only reference for normal clinical flows. Updates must occur through the existing loading process or a controlled administrative mechanism, if actually necessary.

### 7.5. Redis: full-catalog caching and efficient access

Implement a caching strategy that uses Redis to store the reference catalog and enable repeated low-latency queries.

The strategy must account for the actual size of the JSON files and the number of imported records.

After measuring the volume, choose among:

- Full catalog caching in an appropriate Redis structure.
- Caching by code and identifier.
- Caching sets or lists indexed by category.
- A combination of these strategies.

Because Vitare's requirement is to prioritize caching the disease dictionary, the implementation should seek to keep the most relevant reference records—or the complete catalog, if volume permits—available in Redis, without overloading memory or the startup process.

When the volume allows the entire catalog to be stored, consider using Redis hashes indexed by normalized codes and persistent identifiers, as well as specific search structures according to the required queries.

Do not use a single monolithic structure that requires downloading and deserializing the entire catalog to answer each individual query.

### 7.6. O(1) complexity — technically correct definition

Implement associative access by code or identifier using suitable mechanisms, for example:

- `HGET` in a Redis hash with a field identified by code.
- Caching by identifier with a predictable key.
- A local `Map` indexed by code, if there is an appropriately sized and correctly maintained in-memory structure.

These structures can provide average O(1) key access for suitable direct-lookup cases.

However, **do not claim that every disease search is O(1)**.

Text searches, queries requiring filters, sorting, substring searches, and pagination have their own costs.

Likewise, loading the entire catalog requires work proportional to the data volume, and PostgreSQL query costs depend on the execution plan and indexes used.

The goal is efficient associative access to codes and identifiers, avoiding repeated scans of the entire dataset.

### 7.7. Cache-Aside, TTL, and updates

Implement a Cache-Aside strategy with a 24-hour TTL for applicable cached records and sets.

Use a namespace and key version compatible with Vitare's general Redis strategy.

Queries must follow a controlled flow:

1. Query the cache.
2. Validate the retrieved content.
3. Query PostgreSQL on a cache miss.
4. Populate Redis with the result or planned structure.
5. Respect the configured TTL.
6. Return the result.

For the full catalog, avoid rebuilding the same structure simultaneously in several requests after expiration.

Implement an initialization and update strategy that prevents cache stampedes and does not return a partially loaded catalog as though it were complete.

If Redis contains a full catalog structure, define how it will be replaced after seeding. Updates must prevent queries from observing a partially updated state.

Consider building a new version of the structure and switching the active reference when appropriate for the chosen design.

If Redis is unavailable, apply the defined fallback policy for reference queries, with timeouts and observability.

### 7.8. PostgreSQL indexes and text searches

Redis does not replace database indexes.

Maintain appropriate indexes for queries by code and identifier.

For text searches, examine the filters actually used and query plans. If substring searches are performed on large datasets, evaluate an indexing strategy suitable for PostgreSQL instead of assuming a conventional index will solve every pattern.

Do not introduce advanced search mechanisms that are unnecessary for the actual dataset and features.

### 7.9. Integration with CONDITIONS

The `CONDITIONS` module must query the catalog through internal contracts, without depending on direct Prisma access or reading JSON files.

When recording a patient's condition, the application must validate the reference by identifier or stable code.

The cache may accelerate this validation, but the integrity of the persisted relationship must remain protected by PostgreSQL.

Catalog updates must not improperly modify individual clinical records or change historical snapshots already captured.

### 7.10. Tests and acceptance criteria

Implement or fix tests for:

- Reading and validating existing JSON files.
- Compatibility with the official seed.
- Idempotent loading when compatible with the current mechanism.
- No catalog duplication.
- Reference integrity.
- Lookup by code.
- Cache hits and misses.
- A 24-hour TTL.
- Catalog invalidation and updates.
- Recovery of state after Redis failure.
- Safe rebuilding of the full cache, if adopted.
- Concurrent cache initialization and updating.
- Text search and pagination, when implemented.
- Compatibility with the `CONDITIONS` module.

Do not invent official codes or descriptions to complete tests. Use actual catalog records for integration tests and clearly identified synthetic fixtures for unit tests.

Do not declare the dictionary complete without verifying the seed, schema, persistence, and cache behavior.

---

# MODULE 8 — CONTACTS: EMERGENCY CONTACTS

Implement or refactor the `CONTACTS` module, responsible for maintaining family members, guardians, and other contact persons linked to the patient's medical record.

The implementation must respect Clean Architecture, pragmatic DDD, and SOLID, using the existing schema, repositories, and contracts as its starting point.

## 8.1. Mandatory audit

Examine:

- The current structure of `apps/api/src/modules/contacts/`.
- Prisma models and relationships with patients.
- Controllers, services, repositories, DTOs, and tests.
- Deletion and deactivation rules.
- Telephone normalization.
- Contracts used by `apps/web`.
- The current mechanism for capturing contacts in the clinical snapshot.
- Whether integrations with notification services exist.
- Available access restrictions and audit mechanisms.

Do not assume that an SMS, email, or phone-call provider exists. Implement only integrations that are actually present or authorized within the project's scope.

## 8.2. Functional responsibilities

The module must allow the application to:

- Register contacts linked to a patient.
- Retrieve contacts.
- Update permitted information.
- Remove or deactivate a contact according to the established policy.
- Record a name and telephone number.
- Record family relationship or other relationship, if the model supports this field.
- Set contact priority, when provided for.
- Validate record ownership.
- Return the ordering appropriate for operational use.
- Provide the data required for the emergency snapshot.

Preserve the names and formats of existing fields when compatible with the requirements.
Do not create superfluous fields to reproduce an idealized structure if the current model already meets the purpose.

## 8.3. Contact identity and validation

Normalize telephone numbers into a consistent representation, preserving the country code and number when this information is known and needed.

Syntactic validation of a telephone number does not prove that the number belongs to the contact.

Do not automatically associate contacts with user accounts. An emergency contact may be someone who does not use Vitare.

If verification of contact ownership is required, implement it as a dedicated flow if a service and requirement for it exist.

## 8.4. Domain rules

Define clear rules for:

- The number of contacts, if there is a business limit.
- Identification of the priority contact, if this feature exists.
- Updating data.
- Removal or deactivation.
- Integrity of the association with the patient.
- Ordering and retrieval.
- Historical preservation, where applicable.

Avoid restricting operations with arbitrary rules that are not part of the domain.

If the priority rule allows only one primary contact, enforce this invariant in the database and application layer when necessary, including under concurrent operations.

## 8.5. Security and privacy

Contacts contain third-party personal data. Therefore:

- Do not expose contacts through public endpoints.
- Restrict reading to the owning patient and professionals authorized for the corresponding purpose.
- Do not allow unrestricted listing of telephone numbers.
- Avoid logging complete telephone numbers.
- Validate every query and change against the access scope.
- Do not allow a user to change another patient's contacts merely by knowing the record identifier.

If a rescuer needs to query contacts during an emergency, use the authorization flow of `STAFF` and `EMERGENCY` instead of opening the entire module.

## 8.6. Integration with emergencies and notifications

The module must provide the data required by use cases that compose the clinical snapshot or send a notification.

Reading contacts does not imply that a notification was sent.

If a real notification integration exists, the flow must properly record the outcome of the attempt according to the contract of the service being used.

Distinguish between:

- Registered contact.
- Contact eligible to be notified.
- Notification created.
- Notification accepted by the provider.
- Delivery confirmed, when the provider supplies that confirmation.

Do not return delivery statuses that have not been verified.

If notification integration is outside the current scope, provide the required internal contract and document the dependency without simulating a send.

## 8.7. Historical snapshot

When composing an emergency snapshot, use the existing contacts according to the capture policy.

The snapshot must preserve the data available at the moment of capture, subject to data-minimization limits.

Later changes to a patient's contacts must not silently update the original snapshot.

If the retention policy requires anonymization, deletion, or reduction of information, handle that separately and document its impact on history.

## 8.8. Internal architecture

**Domain**

- Contact entity or aggregate, as required.
- Value Objects for telephone numbers, if useful.
- Ownership rules and invariants.

**Application**

- Use cases for creation, retrieval, updating, and deactivation.
- Query contracts for the medical record and emergency flow.

**Infrastructure**

- Prisma persistence.
- Mappers.
- Adapters for notification services, where they exist.

**Presentation**

- Controllers.
- DTOs.
- Guards.
- HTTP validation and conversion.

The module must not directly depend on `EMERGENCY` implementations or external providers.

## 8.9. Tests and acceptance criteria

Test:

- Contact creation and retrieval.
- Updating and removal or deactivation.
- Association with the correct patient.
- Telephone normalization.
- Validation of limits and priorities, where present.
- Rejection of unauthorized access.
- Isolation between patients.
- Inclusion in the snapshot.
- Preservation of historical data.
- Notification integration only when the actual provider is available.
- Referential integrity and concurrency for priority rules.

Do not consider the module complete merely because CRUD operations work. Authorization over third-party data is also an essential part of completion.

---

## MODULE 9 — FORBIDDEN-MEDICATIONS: PROHIBITED MEDICATIONS AND MEDICATION RESTRICTIONS

Implement or refactor the `FORBIDDEN-MEDICATIONS` module, applying Clean Architecture, Domain-Driven Design (DDD), and SOLID principles, integrated with the reference database **already present in the Vitare 2026 project, consisting of `.json` files located in `prisma/data/` and the existing loading mechanism in `seed.ts`**.

This module is responsible for identifying, querying, and applying medication restrictions that prohibit certain associations between medications and patients, using the reference data actually available in the project.

**Do not create an independent new data source, duplicate existing catalogs, or replace the JSON files or seed process with a parallel implementation.**

### 9.1. Mandatory audit of the existing database

Before changing the module, examine:

- The current structure of `apps/api/src/modules/forbidden-medications/`.
- Existing controllers, services, repositories, DTOs, and tests.
- All relevant JSON files in `prisma/data/`.
- The structure and contents of files representing medications, active ingredients, restrictions, contraindications, or related references.
- The `seed.ts` responsible for loading these data into PostgreSQL.
- `schema.prisma` and migrations that define the corresponding entities and relationships.
- The `MEDICATIONS` and `MEDICATIONS-DICTIONARY` modules.
- The `ALLERGIES` module, to identify existing clinical integrations.
- HTTP contracts currently used by the frontend.

Explicitly identify which JSON files contain data applicable to medication restrictions and which provide only reference information about medications and active ingredients.

Do not assume the existence of fields, relationships, identifiers, or rules that are not present in the project.

If the JSON files already contain the necessary restrictions, reuse that data. If they contain only the medication and active-ingredient catalog, use that database to establish possible references, but do not invent medical restrictions that are not documented.

If a specific contraindication dataset is found to be missing, document the gap and implement the domain mechanism for receiving valid restrictions, without presenting fictitious records as real clinical data.

### 9.2. Mandatory integration with the existing JSON files and seed

The data flow must preserve the responsibilities of the current components:

- **JSON files in `prisma/data/`:** existing reference sources used by the official loading process.
- **`seed.ts`:** responsible for importing and synchronizing reference data with PostgreSQL, according to the current structure.
- **PostgreSQL:** persistent source queried while the API is running.
- **`MEDICATIONS-DICTIONARY`:** master catalog used to identify medications and active ingredients.
- **`FORBIDDEN-MEDICATIONS`:** mechanism that applies medication restrictions to patients.
- **`MEDICATIONS`:** consumer module that must validate these restrictions before persisting a medication addition or change.

Before creating tables, entities, or additional files, verify whether the required data and relationships already exist.

Reuse the schema, reference records, and seed process whenever appropriate. If there is a demonstrated need to extend the persisted model, do so through migrations compatible with existing records, without duplicating catalogs or discarding data.

Do not import JSON files on every HTTP request. The API must query data already loaded into PostgreSQL, using internal contracts and the shared Redis cache where appropriate.

The seed must remain the official loading mechanism for the existing reference data. Do not create a second seed exclusively for this module if the current process already covers that responsibility.

If `seed.ts` needs to be extended, preserve its organization and make importing reproducible, validated, and idempotent when compatible with the keys and persistence operations being used.

### 9.3. Functional responsibilities of the module

The module must provide operations to:

- Query medication restrictions applicable to a patient.
- Identify formally prohibited medications or active ingredients, according to the data and rules actually established.
- Associate a restriction with a patient when that association is part of the existing model and is authorized.
- Query the origin and rationale of the restriction, when available.
- Activate, deactivate, or update restrictions according to business rules.
- Check for conflicts between active medications and registered restrictions.
- Make verification results available to the `MEDICATIONS` module.
- Apply authorization rules to the retrieval and modification of clinical information.

Distinguish these categories of information:

1. **Master catalog:** medications, active ingredients, and reference identifiers from the existing data.
2. **Restriction rule:** information establishing that a particular medication or active ingredient cannot be used in a defined context.
3. **Patient-specific restriction:** association of a rule or reference record with the medical record, when the existing domain allows this behavior.
4. **Patient's active medication:** a record maintained by the `MEDICATIONS` module that must be validated against applicable restrictions.

Do not confuse the existence of a medication in the catalog with the existence of a restriction against it.

### 9.4. Canonical references and data consistency

Whenever possible, use persistent identifiers and relationships already established between data loaded from the JSON files and records in PostgreSQL.

Matching must use stable medication or active-ingredient identifiers and must not rely exclusively on textual name comparisons.

If the source contains synonyms or multiple presentations of the same medication, use only equivalence relationships actually present in the data or defined by validated rules.

Do not automatically associate distinct medications merely because their names are similar.

If the existing catalog does not provide an appropriate reference key, evaluate how to extend the model without silently changing the meaning of records. All normalization must preserve traceability to the original source.
The module must remain functional when the cache is empty or unavailable. Where applicable, PostgreSQL must underpin the integrity of associations.

### 9.5. Critical integration rule with MEDICATIONS

The `MEDICATIONS` module must query `FORBIDDEN-MEDICATIONS` through an internal contract defined by the application.

Before persisting a medication addition or update, the corresponding use case must check whether the operation violates any blocking restriction applicable to the patient.

The expected flow is:

1. Receive the medication addition or update operation.
2. Validate the user's identity and authorization.
3. Obtain canonical identifiers for the medication and related active ingredients, when available.
4. Query restrictions applicable to the patient.
5. Evaluate the rules formally defined for the domain.
6. Stop the operation if a blocking restriction exists.
7. Persist the change only when the checks allow the operation.
8. Return a result or error consistent with the HTTP contract.

When a blocking conflict exists, the system must throw a typed domain exception. The API must convert it into an appropriate HTTP response without revealing unnecessary clinical information.

The check must happen in the backend. Disabling a button in the frontend or displaying a visual warning is not sufficient.

**A prohibited operation must not persist partially.** The check and write must use a transactional or consistency strategy suitable for the domain rules, especially when restrictions and medications may be changed concurrently.

Do not create artificial clinical rules to demonstrate that the mechanism works. Use the actual restrictions available in the project and clearly identified synthetic fixtures exclusively in tests.

### 9.6. Clean Architecture, DDD, and SOLID

Refactor the module while keeping responsibilities clearly separated.

**Domain**

It should contain, when justified by the domain:

- Entities and Value Objects related to restrictions.
- Eligibility rules.
- Blocking policies.
- Invariants for the relationship between a restriction and a medication.
- Typed domain exceptions.

**Application**

It should contain:

- Use cases for querying, registering, or updating restrictions.
- A use case or application service that performs the check consumed by `MEDICATIONS`.
- Query and persistence contracts.
- Coordination of the checks required for the business decision.

**Infrastructure**

It should contain:

- Concrete implementations of repositories using Prisma.
- Mappers between persisted records and domain or application models.
- Integration with the persisted catalog.
- Use of Redis when necessary and compatible with the cache policy.

**Presentation**

It should contain:

- Controllers.
- DTOs.
- Input validation.
- Conversion of domain failures into HTTP responses.

The domain must not depend on NestJS, Prisma, Redis, or concrete infrastructure classes.

Do not allow circular dependencies between `FORBIDDEN-MEDICATIONS`, `MEDICATIONS`, and `MEDICATIONS-DICTIONARY`. The medications module must consume a verification contract without directly importing the concrete implementation of the restrictions module.

### 9.7. Redis and performance

Use the project's shared Redis adapter to accelerate reference queries when this provides a measurable benefit.

The implementation must respect these distinctions:

- JSON files are sources for loading existing data.
- PostgreSQL is the persistent source.
- `MEDICATIONS-DICTIONARY` provides catalog references.
- `FORBIDDEN-MEDICATIONS` evaluates restriction rules.
- Redis may accelerate queries but must not replace the persistent restriction records.

If queries are cached, define a key that takes into account patient scope, relevant identifiers, and the adopted versioning or invalidation policy. Do not allow one patient's cache entry to be improperly reused for another patient.

After a restriction is changed, invalidate or update affected entries according to the consistency policy.

Do not indiscriminately cache complete medical records or sensitive clinical information in shared cache storage.

For in-memory joins across multiple medications and active ingredients, use a `Map` indexed by canonical keys when this eliminates repeated lookups. Avoid nested loops that repeatedly perform linear searches over the same collections.

Do not claim that every join is O(1): lookup by key may have average O(1) access in an associative structure, but index construction, record volume, and comparison rules also determine total cost.

### 9.8. Migrations and data preservation

Before changing `schema.prisma`, check existing relationships and constraints.

If persistent entities need to be created or modified:

- Preserve existing records.
- Create compatible migrations.
- Use appropriate keys and constraints.
- Avoid orphaned references.
- Define behavior for deletion and deactivation.
- Do not remove reference data without an explicit policy.
- Update the existing seed only when necessary.
- Test compatibility among the JSON files, seed, schema, and repositories.

Do not consider simply creating a table sufficient to integrate the module with the existing data source.

### 9.9. Tests and acceptance criteria

Implement or fix unit, integration, and E2E tests to verify:

- Compatibility of the module with the JSON files that actually exist.
- Correct integration with the seed process.
- Preservation of relationships and reference identifiers.
- Querying restrictions applicable to a patient.
- Integration with `MEDICATIONS-DICTIONARY`.
- Blocking of operations incompatible with formal restrictions.
- No partial persistence for blocked operations.
- Handling of nonexistent identifiers.
- Consistency under concurrency.
- Cache behavior after restriction updates.
- Data isolation between patients.
- Compliance with access permissions.
- No duplication of catalogs or parallel loading mechanisms.

Run the available tests and record the actual results.

Do not declare the module complete merely because files have been reorganized or compilation succeeded. Integration must be demonstrated through application behavior and data consistency.

---

# MODULE 10 — EMERGENCY: EMERGENCY OPERATIONS CENTER, TRIGGERING, OPERATIONAL TRIAGE, AND DISPATCH

Implement or refactor the `EMERGENCY` module as the operational core of Vitare emergency incidents.

This is a high-criticality module because it coordinates triggering, clinical data displayed during care, selection of eligible professionals, persistence of states, and communication with the monitoring team.

The module must apply Clean Architecture, pragmatic DDD, SOLID, transactional consistency, and explicit failure-recovery mechanisms.

Do not treat a successful API response as proof that an incident has been routed, received, or handled.

## 10.1. Mandatory audit

Before modifying the code, examine:

- The structure of `apps/api/src/modules/emergency/`.
- The controller, services, repositories, DTOs, and tests.
- The `EmergencyEvent` model and existing state enums in Prisma.
- The current structure of the `patientSnapshot` field.
- Emergency-related migrations.
- Contracts used by `apps/web` and `apps/web-staff`.
- The existing `POST /api/v1/emergency/trigger` endpoint.
- Patient and staff emergency queries.
- The current idempotency mechanism, if any.
- The Redis infrastructure planned for the project.
- The location implementation in the `STAFF` module.
- Authentication and authorization mechanisms in `AUTH`.
- The notification strategy, external services, and Gateway, if present.
- Event deletion and retention policies.

Preserve existing data, endpoints, and functional states wherever compatible.

Before creating new fields, verify whether the concepts are already represented in the schema.

## 10.2. Responsibilities

The module must coordinate:

- Receipt of an emergency trigger.
- Validation of the source and payload.
- Identification of the operation using an idempotency key.
- Emergency persistence.
- Capture of the clinical snapshot.
- Recording of triggering and receipt timestamps.
- The incident's operational state.
- Queries for authorized emergencies.
- Selection of eligible professionals.
- Publication of real-time events.
- Acceptance and assignment of an incident.
- Valid state transitions.
- Resolution or closure.
- Auditing of critical operations.
- Recovery of the flow after network failure or processing interruption.

The module must not absorb persistence for all individual clinical data. It must consume contracts from the respective contexts and preserve their boundaries.

## 10.3. Trigger contract

Preserve `POST /api/v1/emergency/trigger` whenever possible.

Inspect the frontend to determine the actual names and formats of the fields it uses. Any request evolution must account for compatibility with the existing PWA.

The endpoint must validate:

- The requester's identity and authorization.
- Latitude and longitude, when present.
- Idempotency key.
- Snapshot version and structure.
- Size limits.
- Field types.
- Dates received from the device.
- Identifier integrity.
- Consistency between the data and the authenticated identity.

Latitude must be between -90 and 90, and longitude between -180 and 180.

Do not treat a missing coordinate as equivalent to zero.

If the device is offline, the backend can only process receipt when the request reaches the server. Do not claim that an emergency has been received while it remains only on the device.

## 10.4. Clinical Snapshot

Evolve the existing JSONB snapshot capture while preserving compatibility with current records.

The model must be versioned and clearly represent data provenance.

Consider, according to the actual contract:

- Snapshot schema version.
- Incident identifier.
- Patient identifier, when needed.
- Demographic data required for care.
- Active medications.
- Allergies.
- Chronic conditions.
- Emergency contacts.
- Relevant clinical restrictions.
- Time of triggering.
- Time the server received it.
- Time of the last known clinical synchronization.
- Data origin.
- Fields identifying staleness or synchronization status.

Do not assume that all these fields currently exist. Implementation must start from the modules already present in the system.

### Online snapshot

When connectivity is available and the contract so requires, the backend must query persisted clinical data and compose the snapshot according to the capture policy.

### Offline snapshot

When the device has stored an offline operation, the contract must permit submission of the local snapshot, where required.

The server must validate the schema and distinguish data received from the client from data queried directly from the database.

Do not treat content originating in the browser as a clinical query that has been updated and confirmed by the server.

Record relevant dates and the schema version, preventing old snapshots from being interpreted incorrectly by future API versions.

### Historical immutability

The original snapshot must be preserved after the incident is created.

Do not silently update historical content when the patient changes their medical record.

Subsequent corrections must follow an explicit versioning, annotation, or auditing policy.

JSONB does not guarantee immutability by itself. Implement this rule in the domain layer and persistence operations, restricting permitted changes.

Review cascading deletions and event retention to prevent accidental removal of important historical data.

## 10.5. Persistent idempotency

Implement `X-Idempotency-Key` for emergency triggering.

The same operation, when repeated because of a timeout, connection loss, or PWA resubmission, must not create multiple incidents.

The mechanism must:

1. Validate the key.
2. Associate it with the requester and operation scope.
3. Calculate a fingerprint of the relevant payload.
4. Reserve the operation consistently.
5. Persist the emergency and idempotent result in a coordinated manner.
6. Recognize repetitions that are still in progress.
7. Return the previous result for the same completed operation.
8. Reject reuse of the key with an incompatible payload.
9. Establish retention and recovery policies.
10. Cover concurrency across multiple API instances.

### Redis and PostgreSQL

Redis should accelerate recognition of repeated operations and may assist with distributed coordination.

However, idempotency must not depend exclusively on Redis.

PostgreSQL must maintain the required persistent guarantee through unique keys, transactions, and appropriate idempotency records.

Loss, expiration, or restart of Redis must not permit an already-persisted operation to be inadvertently duplicated.

Do not implement a flow in which the emergency is confirmed in the database and, only afterward, an essential idempotency key is written independently without any recovery mechanism.

## 10.6. Lifecycle and state machine

Review existing states such as `TRIGGERED`, `NOTIFIED`, and `RESOLVED`.

Preserve compatibility with current contracts where possible. If additional states are needed, update the schema, migrations, services, and consumers in a coordinated manner.

Formalize the permitted transitions.

For each critical operation, determine:

- Expected previous state.
- Resulting state.
- Authorized role.
- Execution conditions.
- Persistent effects.
- Event to publish.
- Auditable information.

Do not allow direct state changes by a controller without use-case validation.

Distinguish receipt by the server, notification sent, incident accepted, and resolution. Do not treat these concepts as synonyms.

A transition must be performed conditionally against the current state, preventing two concurrent operations from producing incompatible results.

## 10.7. Geospatial selection of professionals

Implement a pure, testable function to calculate the distance between two coordinates using the Haversine formula.

Use documented constants, conversion to radians, and appropriate numerical handling. The function must return a clearly defined unit and have tests for identical coordinates, known points, and edge cases.

Calculating the distance between one pair of coordinates has O(1) cost. Selecting the nearest professional among N professionals is not O(1) if all candidates are traversed.

To avoid unnecessary linear searches, use the Redis geospatial index when suitable for the environment.

Recommended flow:

1. Receive the incident coordinates.
2. Query professionals located within a configured radius.
3. Remove unavailable candidates or those with stale locations.
4. Filter by role and eligibility.
5. Calculate final distances using Haversine.
6. Sort or select the appropriate K candidates.
7. Persist or coordinate assignment according to the operational policy.
8. Publish the appropriate notifications.

Define the radius limits, candidate count, and location-staleness threshold through configuration.

Do not invent availability or use stale locations as if they represented current positions.

If Redis is unavailable, apply the explicit policy for the critical service. Do not silently route an incident to teams selected from unsuitable data.

## 10.8. WebSocket and Socket.IO communication

Implement `@WebSocketGateway` with Socket.IO for real-time operational communication.

The gateway must be an adapter, without domain business rules directly dependent on the infrastructure.

Implement:

- Connection authentication.
- Token validation.
- Authorization by role and scope.
- Room or channel control.
- Subscription to permitted events.
- Event publication after confirmation of the persisted result.
- Reconnection and recovery.
- Event identification.
- Duplicate handling.
- Publication observability.
- Connection or message rate limiting when necessary.

Do not broadcast the complete clinical snapshot indiscriminately.

Notification events must contain only the minimum information required for the operation, according to recipient authorization. The snapshot must be retrieved through a protected REST endpoint after access validation.

### Publication reliability

If an incident is persisted but WebSocket publication fails, the system must not permanently lose the operational notification.

Implement a server-side Outbox pattern when necessary to ensure publishable events can be recovered after failures.

The event must be recorded in the same transaction that establishes the business state requiring publication. A worker or dispatcher may publish it and record the attempt, following a retry and deduplication policy.

Do not consider Redis Pub/Sub, by itself, a guarantee of persistent delivery.

If the project runs multiple API instances, correctly configure Socket.IO event distribution and document the required infrastructure. Do not assume that an event emitted in memory by one instance will automatically reach clients connected to another instance.

## 10.9. Acceptance, assignment, and resolution

Implement explicit operations for operational activities, according to the actual model:

- Query eligible incidents.
- Accept an incident.
- Assign a rescuer or team.
- Query authorized details.
- Change status during care.
- Resolve or close the incident.

Assignment must be atomic according to the domain policy.

If two professionals attempt to take the same incident, the system must guarantee the result allowed by the model: a single exclusive assignment when required, or a formally defined multiple relationship when the incident supports a team.

Do not leave this decision implicit.
Record the actor, timestamp, and operational data for each critical transition.

## 10.10. Observability

Record metrics and structured logs for:

- Received triggers.
- Repeated idempotent operations.
- Payload conflicts.
- Persisted emergencies.
- Snapshot-capture failures.
- Geographic candidates found.
- Notification failures.
- Pending Outbox events.
- Publication time.
- Acceptances and assignments.
- Resolutions.
- Authorization errors.

Do not log complete clinical snapshots, passwords, tokens, or credentials.

## 10.11. Internal architecture

**Domain**

- Emergency aggregate or entity.
- State machine and invariants.
- Value Objects for location and identifiers.
- Eligibility policies.
- Required domain events.

**Application**

- Use cases for triggering, retrieval, assignment, and resolution.
- Persistence contracts.
- Contracts for geospatial selection, publishing, and Outbox.
- Coordination of transactions and idempotency.

**Infrastructure**

- Prisma repositories.
- Redis adapter.
- Geospatial index.
- Outbox persistence.
- Event dispatcher.
- Adapters required for Socket.IO.

**Presentation**

- HTTP controllers.
- DTOs.
- WebSocket Gateway.
- Guards and connection authorization.
- Error conversion and input validation.

Do not allow the domain entity to import Prisma, Redis, or Socket.IO classes.

## 10.12. Tests and acceptance criteria

Implement tests demonstrating:

- Correct coordinate validation.
- Haversine calculation.
- Incident creation.
- Idempotency under concurrency.
- Rejection of a divergent payload using the same key.
- Snapshot preservation.
- Rejection of invalid transitions.
- Concurrent assignment.
- Filtering by availability and role.
- Selection of professionals by distance.
- Gateway and REST endpoint authorization.
- Recovery of pending Outbox events.
- Consistent persistence when intermediate failures occur.
- History pagination.
- Handling Redis and PostgreSQL unavailability.

Do not declare the module complete merely because the Gateway connects or the distance calculation works in isolation. The complete persistence, authorization, assignment, and publication flow must be validated.

---

# MODULE 11 — STAFF: OPERATIONAL MANAGEMENT, GEOLOCATION, AND AUTHORIZED CLINICAL ACCESS

Implement or refactor the `STAFF` module, responsible for the operational identity of professionals, availability, location, and access to incidents consistent with their assignments.

The module must integrate with `AUTH`, `EMERGENCY`, `PATIENTS`, and other required contexts without concentrating all responsibilities in those modules.

## 11.1. Mandatory audit

Examine:

- The structure of `apps/api/src/modules/staff/`.
- Staff authentication controllers and services.
- Existing Prisma entities and relationships.
- Current roles and authorization mechanisms.
- Location endpoints.
- The emergency feed used by `apps/web-staff`.
- HTTP services consumed by the operational frontend.
- Current availability and assignment states.
- Patient and snapshot query routes.
- Audit and logging mechanisms.
- Redis configuration planned for the project.

Preserve operational application contracts whenever possible and fix incompatibilities before adding parallel endpoints.

## 11.2. Responsibilities

The module must provide mechanisms to:

- Retrieve the professional's operational profile.
- Retrieve their effective permissions.
- Update location.
- Record the time of the last location update.
- Update availability, where permitted.
- Query incidents compatible with the profile.
- Accept or monitor incidents according to the domain contract.
- Query the clinical snapshot when authorized.
- Record relevant operational activities.
- Expose the data required by the staff frontend.

Distinguish the professional's registration data from their current geographic position, availability, and operational association with an incident.

Do not represent all these pieces of information in a single freely updatable object.

## 11.3. Real-time location

The API must validate received coordinates and associate them with the authenticated professional's identity.

A client must not be able to submit another professional's identifier to update their location.

The record must take into account:

- Valid latitude and longitude.
- Update date and time.
- Authenticated identity of the sender.
- Operational availability.
- A reasonable maximum update frequency.
- A policy for stale data.
- Abuse controls and excessive-update protection.

Define a rule for identifying a stale location.

When a position's Redis TTL expires, do not consider the professional automatically available. The absence of a recent position must lead to the eligibility behavior defined by the domain.

## 11.4. Redis Geo

Integrate professional locations with the Redis geospatial index used by `EMERGENCY`, avoiding incompatible representations of the same position in each module.

Define key conventions and member identifiers consistently.

The position write must associate the professional's stable identifier with the coordinates, enabling proximity queries.

Consider mechanisms to prevent races between old and new updates, so that a delayed message does not silently overwrite a more recent position.

Redis must be treated as the operational index for current location, while persistent records required for auditing remain in the persistence mechanism defined by the project.

Do not persist every geographic update indefinitely without a business need and retention policy.

## 11.5. Availability and eligibility

Implement explicit rules to determine which professionals can receive an emergency.

Consider the following, according to existing requirements:

- Professional role.
- Availability status.
- Existence of a valid location.
- Location freshness.
- Proximity.
- Operational restrictions.
- Incidents already assigned.
- Incident status.

Do not determine eligibility solely from the fact that the account is authenticated.

The `EMERGENCY` module must consume a clear contract for selecting and querying candidates, avoiding direct access to internal entities or repositories of the `STAFF` module.

## 11.6. Incident acceptance and assignment

Implement the flow needed for acceptance and assignment, coordinating it with the `EMERGENCY` module.

The operation must:

- Validate the professional's role.
- Verify the incident.
- Validate its current state.
- Check assignment conflicts.
- Apply the change consistently.
- Record the responsible person and timestamp.
- Publish the corresponding operational event after persistence.

Do not allow an unauthorized professional to assign incidents to themselves using an arbitrary identifier.

When the system requires exclusive assignment, concurrency must be resolved through an atomic operation or appropriate transaction.

## 11.7. Read-only access to the Clinical Snapshot

Access to the clinical snapshot must be protected by an authorization policy that considers the emergency context.

The query must verify:

1. Authenticated identity.
2. The professional's role and permissions.
3. Incident exists.
4. Compatible operational status.
5. Assignment, acceptance, or required authorization.
6. Scope of the clinical data that may be viewed.

Do not allow the mere fact that a user has the `RESCUER_STAFF` role to grant unrestricted access to any medical record.

The snapshot must be retrieved through a protected REST endpoint, using internal application contracts.

The operation must be read-only. Do not allow changes to the snapshot through generic profile-update or emergency-update endpoints.

Audit access to clinical content according to the system's model, without logging the complete content in general logs.

Distinguish authorization to view an incident from authorization to query the clinical snapshot.

## 11.8. Integration with the operational feed

The `apps/web-staff` frontend already has a feed that queries emergencies through the API.

Maintain compatibility with current contracts and integrate the WebSocket mechanism implemented in `EMERGENCY`, when it is complete.

The feed must not depend exclusively on real-time events. After reconnection or a socket failure, the persisted state must be recoverable through HTTP queries.

The backend must ensure that paginated queries return states consistent with the domain model without exposing clinical data beyond the requester's permissions.

Do not turn the feed into an unrestricted endpoint for exporting the complete history of all patients.

## 11.9. Clean Architecture, DDD, and SOLID

**Domain**

- Availability and eligibility rules.
- Location Value Objects, where useful.
- Operational states.
- Assignment invariants.

**Application**

- Use cases for updating location.
- Operational-profile retrieval.
- Eligibility queries.
- Acceptance and monitoring of emergencies.
- Authorized snapshot queries.

**Infrastructure**

- Prisma repositories.
- Redis Geo adapter.
- Position persistence and recovery.
- Event adapters.

**Presentation**

- Controllers.
- DTOs.
- Guards.
- Operational endpoints.
- WebSocket integration when required.

Do not allow the domain to depend on Prisma or Redis.

## 11.10. Tests and acceptance criteria

Implement tests for:

- Location updates.
- Coordinate validation.
- Isolation between professionals.
- Concurrent location updates.
- Position expiration and staleness.
- Eligibility by role and availability.
- Acceptance and assignment.
- Concurrent conflicts.
- Authorized snapshot queries.
- Denial of access to other emergencies.
- Feed recovery through HTTP.
- Redis Geo integration.
- Persistence and publication failures.

The module may be considered complete only when the operational flow is consistent, authorized, and recoverable after connection loss.

---

# MODULE 12 — HEALTH: API HEALTH, READINESS, LIVENESS, STARTUP, AND OBSERVABILITY

Implement or refactor the `HEALTH` module as the central operational verification point for the NestJS API.

The goal is to allow runtime and monitoring mechanisms to distinguish between:

- Active process.
- Process ready to receive traffic.
- Process still starting up.
- Unavailable dependencies.
- Operation in a degraded state.
- Infrastructure failures requiring intervention.

The module must produce structured responses and must not expose internal details or secrets.

## 12.1. Mandatory audit

Examine:

- The existing health endpoint.
- The current controller and service.
- `main.ts` and the API's global prefix.
- Prisma configuration.
- The Redis adapter.
- Health checks in Dockerfiles and Compose files.
- Local and public environment configuration.
- Structured logging mechanisms.
- Dependencies considered critical by the other modules.
- Startup and migration scripts.

Preserve suitable existing contracts. If the current route is `/api/v1/health`, maintain compatibility and explicitly add the required checks.

## 12.2. Liveness

Implement a liveness endpoint that reports whether the process is alive and can handle a basic check.

Liveness must not depend on a PostgreSQL or Redis query on every request.

A temporary external-dependency failure must not, by itself, cause continuous application restart cycles when the process remains healthy and can recover.

The endpoint must be fast, deterministic, and must not perform time-consuming operations.

## 12.3. Readiness

Implement a readiness endpoint to verify whether the instance is ready to receive traffic.

Assess at least the dependencies essential to the API's operational profile:

- PostgreSQL.
- Redis, considering its role in idempotency and geographic selection.

Define the degradation policy explicitly.

If Redis is unavailable but a given catalog query can safely continue through PostgreSQL, that does not necessarily mean the entire API is unavailable.

Conversely, if a component essential to the safety of a critical operation is unavailable, the API must not appear fully ready to perform that operation.

Distinguish between:

- A dependency unavailable for a specific feature.
- A central dependency that prevents the API from accepting traffic.
- An explicitly supported degraded operating mode.

The readiness status must reflect this decision.

When essential dependencies are unavailable, return HTTP 503. When the instance can operate according to the defined policy, return HTTP 200.

Do not return generic HTTP 200 responses to hide failures of mandatory components.

## 12.4. Startup

Implement a startup endpoint that indicates whether the application has completed the steps required for initialization.

Consider, according to the actual configuration:

- Environment loading and validation.
- Initialization of mandatory providers.
- Preparation of technical clients.
- Availability of required dependencies.
- Completion of startup steps that block correct operation.

Do not automatically run destructive migrations at startup.

The endpoint must reflect an explicit application state rather than infer readiness merely because the Node.js process has started.

## 12.5. PostgreSQL verification with Prisma

Use the actual Prisma client and execute a simple query equivalent to `SELECT 1`, using an API compatible with the installed version and generator.

The code must use Prisma's safe query mechanism and must not concatenate external data into SQL.

Measure latency, set a timeout, and handle errors without indefinitely blocking the health check.

Distinguish a valid connection from a connection that is configured but unable to execute queries.

Do not expose internal database messages, connection strings, or credentials in the HTTP response.

## 12.6. Redis verification

Use the project's shared Redis adapter.

Execute `PING` or an equivalent operation supported by the client.

The check must:

- Assess whether Redis responds.
- Measure latency.
- Respect a timeout.
- Distinguish an unavailable connection from an unexpected response.
- Avoid creating excessive new connections on each health check.
- Avoid unnecessary reads or changes to application data.

Reuse the Redis client managed by the infrastructure module instead of creating an independent connection for each health call.

## 12.7. Response contract

Implement a structured JSON response with enough information for operational diagnosis.

A conceptual representation is:

```json
{
  "status": "ok",
  "timestamp": "2026-10-13T12:00:00.000Z",
  "checks": {
    "postgresql": {
      "status": "ok",
      "latencyMs": 4
    },
    "redis": {
      "status": "ok",
      "latencyMs": 2
    }
  }
}
```

The example is illustrative. Adapt names, structure, and types to the existing contracts.

The endpoint must correctly reflect the overall state of the performed check.

Return HTTP 503 when the readiness check indicates that the API is not capable of performing its essential functions.

Liveness and startup must follow their own semantics. Do not indiscriminately reuse the same condition for every endpoint.

Do not return:

- Credentials.
- Tokens.
- Connection strings.
- Unnecessary internal addresses.
- Clinical payloads.
- Stack traces.
- Raw messages containing sensitive infrastructure details.

## 12.8. Timeouts, concurrency, and stability

Health checks will be executed periodically by infrastructure mechanisms.

Therefore:

- Do not allow unbounded queries.
- Avoid expensive operations.
- Do not run complete business tests during a health check.
- Avoid creating unnecessary connections.
- Control the frequency of checks.
- Do not turn a Redis failure into an infinite sequence of retries.
- Avoid blocking the event loop with synchronous operations.
- Use timeout mechanisms compatible with the libraries actually installed.

If a health check is temporarily pending, handle the situation predictably and without overloading dependencies.

## 12.9. Observability

The module must provide the basis for observing API operation without becoming a generic implementation of all system observability.

Use structured logs for dependency failures and metrics for:

- Readiness status.
- PostgreSQL latency.
- Redis latency.
- Connection errors.
- Timeouts.
- Startup time.
- Number of degraded checks.
- Repeated failures of critical dependencies.

Avoid storing unnecessary high-cardinality data and do not include personal information in metrics.

Do not use the public endpoint to expose detailed infrastructure information. Separate internal diagnostics from minimal responses intended for health verification.

## 12.10. Docker and deployment

Update health checks in local and public Docker environments to use the correct semantics of the implemented endpoints.

Verify:

- The actual API path and global prefix.
- Availability of the health-check command in the image.
- Timeouts.
- Interval and retry count.
- Startup conditions.
- Behavior during transient failures.
- Compatibility with the actual Prisma and Redis configuration.

Do not assume that the HTTP service is ready merely because the process has started.

Also, do not cause an isolated failure of an optional dependency to repeatedly restart all instances if the operational policy permits safe degradation.

## 12.11. Clean Architecture

The health check is a technical feature, but it must still respect separation of concerns.

**Application**

- Service that coordinates checks.
- Health-check contracts for dependencies.

**Infrastructure**

- PostgreSQL implementation using Prisma.
- Redis-check implementation.
- Collection of latency and technical errors.

**Presentation**

- Controllers and routes.
- Response serialization.
- Conversion of the overall state into an HTTP status.

There is no need to create artificial domain entities to represent simple technical checks.

The health check must use shared infrastructure adapters without duplicating Prisma or Redis configuration.

## 12.12. Tests and acceptance criteria

Implement unit, integration, and E2E tests for:

- PostgreSQL available.
- PostgreSQL unavailable.
- Redis available.
- Redis unavailable.
- PostgreSQL timeout.
- Redis timeout.
- Healthy readiness.
- Degraded readiness.
- Liveness during a dependency failure.
- Startup before and after initialization completes.
- Structured response format.
- Correct HTTP status.
- Absence of sensitive information.
- Compatibility with the Docker health check.

The tests must demonstrate that the API distinguishes process health from dependency availability.

Do not declare the module complete merely because the endpoint responds. Verify that the results reflect the actual state of dependencies, that timeouts exist, and that HTTP status codes correspond to the defined operational policy.

---

# 6. REDIS INFRASTRUCTURE — CROSS-CUTTING IMPLEMENTATION

Redis must be used centrally and consistently.

Do not spread manually created Redis connections across each module.

Implement a reusable adapter that provides typed operations required by the domain, without exposing transport details to every use case.

## 6.1. Redis responsibilities

Use Redis for:

- Cache-Aside for dictionaries.
- Locks or idempotency coordination when needed.
- A geospatial index of recent locations.
- Explicitly approved technical caching.
- Distributed request control, if necessary.
- Potential temporary operational-coordination mechanisms.

Do not use Redis as a replacement for PostgreSQL for historical clinical data, persistent events, or operational state that must not be lost.

## 6.2. Configuration

Create validated configuration for:

- Host.
- Port.
- Credentials, if required.
- TLS, when required by the environment.
- Connection and command timeouts.
- Reconnection policy.
- Key prefix.
- Availability policy.
- Time limits for technical operations.

Do not store real credentials in `package.json`, Dockerfiles, scripts, or source code.

## 6.3. Resilience

Implement an explicit policy for:

- Cache misses.
- Timeouts.
- Unavailable connection.
- Reconnection.
- Invalidly formatted data.
- Expiration.
- Invalidation.
- Concurrent operations on the same key.

Do not use infinite retry loops when Redis is unavailable.

For read-only caching, fallback to PostgreSQL must be possible when safe. For operations that depend on critical distributed coordination, define a safe policy instead of ignoring the failure and continuing inconsistently.

## 6.4. Caching and concurrency

Avoid cache stampedes for the most frequently queried keys.

Use coordination mechanisms or single-flight when appropriate. Do not introduce distributed locks for every read without a measured need.

The cache must have metrics, but must not indiscriminately store clinical payloads or authentication tokens.

---

# 7. ALGORITHM AND DATA-STRUCTURE OPTIMIZATION

All optimizations must be justified by the actual algorithmic cost, existing indexes, and query profile.

## 7.1. Map and associative indexes

Use `Map` for repeated lookups by stable keys, such as:

- Disease code.
- Medication identifier.
- Active ingredient.
- Event identifier.
- Professional identifier.
- Relationships that need to be joined in memory.

When a process must join two collections:

1. Build an associative index for one collection.
2. Traverse the other collection once.
3. Query through the index.
4. Avoid repeated `find()` or `filter()` calls over the entire collection inside nested loops.

A `Map` usually provides average O(1) lookup by key, but the initial index construction still costs O(N).

Do not use Map as a replacement for persistent database indexes when volume, memory, or cross-instance sharing make that strategy unsuitable.

## 7.2. Cursor pagination

Implement keyset pagination for:

- Emergency feed.
- Emergency history.
- Paginated clinical logs.
- Change history that is actually exposed by the API.
- Large operational lists.

Use stable ordering, with a unique tie-breaker.

Consider a model based on:

```text
createdAt DESC, id DESC
```

or another ordering that matches the actual entity.

Create the appropriate composite indexes for the queries and use comparison predicates consistent with the ordering.

The cursor must represent the position of the last returned row. Validate its format and prevent malformed values from compromising queries.

Define a maximum number of items per page.

Do not use increasing OFFSET values to traverse extensive histories when the goal is sequential cursor-based navigation.

### Complexity

With a query plan that uses suitable indexes, keyset pagination can have a cost close to O(log N + K), where K is the number of returned records, depending on the plan and data distribution.

Do not claim this cost as a universal guarantee. Validate it using PostgreSQL, indexes, and `EXPLAIN ANALYZE`.

### Acceptance criteria

- Records are not duplicated between pages under normal navigation conditions.
- Ordering is stable.
- Timestamp ties are handled by the tie-breaker identifier.
- Page size is limited.
- Tests cover invalid cursors and pagination with multiple records sharing the same timestamp.

---

# 8. IDEMPOTENCY AS A CROSS-CUTTING CONTRACT

Beyond emergency triggering, identify which mutable operations benefit from idempotency, particularly when they can be resubmitted by the PWA.

Potential examples:

- Emergency triggering.
- Creation of clinical records.
- Adding medications.
- Emergency acceptance or assignment operations.
- Other operations that would produce duplicate effects if repeated.

Do not require idempotency indiscriminately for operations that do not need it.

Define a reusable component in the application/infrastructure layer and the required integration points in controllers.

The header must be validated, and the operation must honor the key throughout the defined retry window.

The policy must cover:

- Requester identity.
- Operation scope.
- Payload fingerprint.
- Persisted result.
- Repetition while the operation is in progress.
- Repetition after completion.
- Divergent payload.
- Expiration.
- Intermediate failure.
- Concurrency across instances.

Use Redis to reduce contention and accelerate duplicate recognition without replacing the persistent guarantee required in PostgreSQL.

Do not generate a new key on the server for every attempt of the same offline trigger. The key must be created and preserved by the client from the first local recording of the operation.

---

# 9. INTEGRATION WITH THE EXISTING OFFLINE PWA

The central scope of this task is the backend. Do not refactor the frontends in this execution unless an absolutely necessary minimal contract change is required—in that case, prefer adapting the backend to remain compatible and document the need.

The API must provide the contracts required for the client application to implement secure synchronization.

Ensure support for:

- Idempotency keys for mutable operations.
- Versioned emergency payloads.
- Identification of data origin.
- Identification of trigger and receipt timestamps.
- Explicit persistence result.
- Subsequent emergency retrieval.
- Pagination and history recovery.
- Conflict handling.
- Unambiguous operational states.
- Resource-level authorization.

Do not claim that an operation was delivered to the server unless this has been confirmed.

Conceptually distinguish:

- Operation stored only on the device.
- Operation being synchronized.
- Operation persisted on the server.
- Emergency dispatched for response.
- Emergency accepted by a professional.
- Emergency resolved.

The exact states must correspond to the implemented domain model, avoiding enums incompatible with the project.

The backend must not assume that the client will always be online, nor accept every offline payload without validation.

---

# 10. POSTGRESQL, PRISMA, AND TRANSACTIONAL INTEGRITY

## 10.1. Prisma

Keep the version and generator actually used by the project unless a proven incompatibility requires otherwise.

Preserve the custom output path for the generated client.

Ensure that the development and Docker workflow includes, in the correct order:

1. Dependency installation.
2. Prisma client generation.
3. Application compilation.
4. Preparation of production artifacts.
5. Controlled execution of migrations.
6. API startup.

Do not depend on generated files being accidentally present in the ZIP archive.

## 10.2. Migrations

Every persistent change must have a migration compatible with current data.

Do not delete tables or columns containing data to simplify refactoring.

Before changing fields, enums, or relationships:

- Identify all consumers.
- Plan the migration.
- Define transition values where necessary.
- Preserve existing records.
- Update tests and queries.
- Document manual operations that cannot be performed automatically.

Do not run migrations against production during the task.

## 10.3. Integrity and transactions

Use PostgreSQL constraints whenever needed to enforce persistent invariants.

Consider:

- Primary keys.
- Foreign keys.
- Uniqueness.
- `NOT NULL`.
- Indexes.
- Transition constraints, where feasible.
- Transactions.
- Concurrency.
- Failure recovery.

Do not rely solely on a prior application-level check to ensure uniqueness or prevent race conditions.

High-concurrency operations must be protected with appropriate database guarantees and conditional updates when necessary.

## 10.4. History and deletion

Review cascading deletions, especially for emergency events and their snapshots.

Do not change the retention policy without analyzing the purpose of the data.

Implement an explicit strategy for deletion, anonymization, or retention according to the project's requirements.

---

# 11. SECURITY, LGPD, AND AUDITING

Review the backend as a whole, not just the AUTH module.

Check:

- Authentication for all protected endpoints.
- Authorization by role and resource.
- DTO validation and transformation.
- Rate limiting where necessary.
- CORS according to the project's actual domains.
- Secrets protection.
- Password hashing.
- Token rotation and revocation.
- Protection against refresh-token reuse.
- Sanitization of log data.
- Protection against improper queries and filters.
- Access control for snapshots.
- Protection of WebSocket channels.
- Request-size limits.
- Endpoint pagination.
- Secure error handling.
- Auditing of privileged operations.
- Retention and deletion policies for clinical information.

Do not log tokens, passwords, API keys, complete clinical payloads, or other sensitive data in general logs.

Implement coherent HTTP responses, using typed errors and exception filters. Do not indiscriminately turn every error into HTTP 500.

Use status codes appropriate to the contract, such as 400 for invalid input, 401 for missing or invalid authentication, 403 for forbidden access, 404 when compatible with the exposure policy, 409 for conflicts, and 422 when a business-rule violation warrants that status.

The final choice must remain consistent with the API's current contracts.

---

# 12. ERROR AND CONTRACT STANDARD

Define a clear strategy for business results and failures.

Avoid having controllers return arbitrary, inconsistent error messages for equivalent situations.

Domain errors must be able to represent concepts such as:

- Unauthorized user.
- Resource not found.
- Blocking medication restriction.
- Invalid emergency transition.
- Divergent idempotency key.
- Duplicate operation in progress.
- Assignment conflict.
- Invalid location.
- Incompatible snapshot.
- Temporarily unavailable dependency.

The HTTP adapter must convert these errors into standardized responses without exposing internal details.

Preserve fields currently consumed by the frontends whenever possible. If the API already has an envelope format, follow that pattern.

Use strict TypeScript according to the existing configuration and eliminate unjustified `any` types.

Do not use `as unknown as` or equivalent conversions to conceal incompatibilities between layers.

---

# 13. CONFIGURATION, DOCKER, AND ENVIRONMENTS

Review local and public configurations to ensure that the backend can be built and started reproducibly.

## 13.1. Docker

Check the entry points produced by the build.

The audit found a discrepancy between `dist/main.js` and `dist/src/main.js` in local and public configurations. Check the current state and fix the inconsistency using the actual path produced by the compiler.

Ensure that Prisma client generation is included in the build workflow.

Do not copy secrets into images.

Use unprivileged runtime users when compatible with the environment.

Configure useful health checks.

## 13.2. Compose

Integrate Redis into the environments in which the backend will depend on it.

Define:

- Redis service.
- Appropriate internal network.
- Connection variables.
- Health check.
- Startup and restart policy.
- API service dependencies.
- Persistence only when required by the purpose.
- Secrets policy.
- Appropriate test configuration.

Do not expose Redis publicly without a need.

The public configuration must not make Redis freely accessible over the internet.

## 13.3. Dependency management

Keep pnpm as the monorepo's official package manager.

Check the version pinned in `package.json` and the Dockerfile configuration.

Avoid creating a second dependency-resolution source for the API when it conflicts with the workspace.

Do not indiscriminately update all dependencies to their latest versions. If an update is necessary, justify it and test compatibility.

## 13.4. Migrations and startup

Do not automatically run destructive migrations on every startup.

Use a migration workflow appropriate to the environment and document how the service should be started on new machines.

---

# 14. MANDATORY TESTING

Repair the current test suite and implement behavior-based coverage.

The previous audit found files with imports apparently copied from other modules, including emergency test files that import medication classes, as well as a root test that references classes not present in the analyzed tree.

Confirm the current state and fix these issues.

Do not count a `.spec.ts` file as valid coverage merely because it exists.

## 14.1. Unit tests

### Domain

Test:

- Invariants.
- Value Objects.
- State transitions.
- Independent authorization rules.
- Coordinate validation.
- Haversine.
- Contraindication rules.
- Idempotency semantics.

Domain tests must not require NestJS, Prisma, or a Redis connection.

### Application

Test use cases with fake dependencies or controlled mocks.

Verify:

- Successful flows.
- Expected failures.
- Invalid states.
- Authorization rules.
- Conflict handling.
- Calls to the correct contracts.
- No persistence for blocked operations.

## 14.2. Integration tests

Implement tests for:

- Prisma repositories.
- Mappers between persistence and domain.
- Migrations.
- Constraints.
- Transactions.
- Indexes and pagination.
- Snapshot persistence.
- Idempotency under concurrency.
- Cache invalidation.
- Location updates in Redis.
- Handling dependency unavailability.

Use an isolated environment. Never run destructive tests against production.

## 14.3. E2E tests

Implement E2E flows covering:

1. Patient registration and authentication.
2. Staff login.
3. An attempt at unauthorized staff registration.
4. An attempt to access another person's medical record.
5. Medication registration and retrieval.
6. Blocking of a prohibited medication.
7. Emergency triggering.
8. Idempotent repetition of the trigger.
9. Rejection of an incompatible payload for the same key.
10. Paginated query of emergencies.
11. Authorization to access the clinical snapshot.
12. Concurrent assignment of an incident.
13. Authenticated WebSocket communication.
14. Readiness when PostgreSQL or Redis is unavailable.
15. Failure and recovery behavior.

## 14.4. Test-suite criteria

Do not change expectations merely to make tests pass.

Do not replace real tests with mocks that remove all the business rules intended to be validated.

When the environment prevents a test from running, record the exact blocker. Do not claim that it passed.

---

# 15. OBSERVABILITY AND PERFORMANCE

Implement structured logs and metrics that make it possible to analyze the most important flows.

Consider metrics for:

- HTTP latency.
- Errors by endpoint.
- Denied access.
- PostgreSQL queries.
- Cache hits and misses.
- Redis errors.
- Haversine latency and geospatial selection.
- Emergencies created.
- Idempotent repetitions.
- Idempotency conflicts.
- Published events.
- WebSocket reconnections.
- Assignment failures.
- Time taken to synchronize states.
- Error rates for external dependencies.

Do not introduce a complete observability stack without a need. Use existing mechanisms and make proportional extensions.

Do not expose clinical information in high-cardinality metrics or include personal identifiers or tokens as labels.

## 15.1. Performance measurement

Optimize based on measurements.

Use `EXPLAIN ANALYZE` on critical queries when access to an appropriate development database is available.

Evaluate indexes, latency, and the execution plan for pagination.

Benchmark password hashing and Redis operations when relevant.

Do not claim a proven optimization merely because the code uses `Map`, Redis, or a cursor.

---

# 16. MANDATORY EXECUTION ORDER

Perform the work in ordered phases without stopping implementation to request authorization at each stage.

## Phase 1 — Audit and stabilization

- Inventory the modules.
- Map existing contracts.
- Identify build errors.
- Fix invalid tests.
- Review credentials and configurations without reproducing secrets.
- Fix Docker discrepancies.
- Ensure correct Prisma generation.
- Establish reproducible commands.

## Phase 2 — Architectural core

- Create internal contracts.
- Establish layer boundaries.
- Implement appropriate tokens and providers.
- Create or adjust Prisma mappers.
- Define the error convention.
- Add automated dependency checks.
- Avoid indiscriminate refactoring without a functional need.

## Phase 3 — Security and AUTH

- Fix authentication and authorization.
- Prevent improper role assignment.
- Implement secure refresh-token rotation.
- Fix asynchronous hashing.
- Test isolation between roles and users.

## Phase 4 — PATIENTS and clinical modules

- Refactor patients.
- Refactor medications.
- Refactor allergies.
- Refactor conditions.
- Refactor contacts.
- Implement cross-checks with prohibited medications.
- Preserve existing relationships and data.

## Phase 5 — Dictionaries and Redis

- Centralize the Redis adapter.
- Implement Cache-Aside.
- Apply a 24-hour TTL to the dictionaries.
- Implement invalidation.
- Adjust queries and indexes.
- Test availability and fallback behavior.

## Phase 6 — EMERGENCY and STAFF

- Implement complete idempotency.
- Ensure consistent snapshot persistence.
- Formalize domain transitions.
- Implement Haversine calculation.
- Implement geospatial selection.
- Implement the Socket.IO Gateway.
- Implement assignment and access controls.
- Integrate notifications after persistence.

## Phase 7 — Pagination and observability

- Implement keyset pagination.
- Adjust indexes.
- Implement health checks.
- Add metrics and structured logs.
- Verify readiness semantics and timeouts.

## Phase 8 — Final verification

- Run Prisma generation.
- Run lint.
- Run typecheck.
- Run unit tests.
- Run available integration tests.
- Run the build.
- Run E2E tests when the environment permits.
- Validate Docker and Compose.
- Update documentation.
- Record outstanding items that depend on external factors.

If time or resources are limited, prioritize security, transactional integrity, and the emergency flow. Complete as much work as possible and honestly report what remains.

---

# 17. GLOBAL ACCEPTANCE CRITERIA

The work may be considered complete only when there is evidence for the applicable items below.

## Architecture

- The 12 modules respect the established architectural boundaries.
- The domain does not depend on NestJS or Prisma.
- Use cases depend on abstractions.
- Prisma adapters perform appropriate mapping.
- No architectural cycles have been introduced.
- SOLID is applied through cohesive responsibilities and useful contracts.

## Redis

- A reusable adapter exists.
- The dictionaries use Cache-Aside.
- The 24-hour TTL is applied and tested.
- Invalidation is defined.
- Failures are handled according to operation criticality.
- Redis does not replace persistence for clinical and historical records.

## Security

- Unrestricted staff registration has been blocked.
- Role- and resource-based authorization is checked in the backend.
- Passwords use asynchronous bcrypt.
- Token rotation is consistent.
- The API does not rely on hiding frontend buttons.
- Sensitive data is not unnecessarily exposed in logs or responses.

## Emergencies

- Triggering is idempotent.
- PostgreSQL protects persistent invariants.
- Snapshots are versioned and preserved.
- Haversine is tested.
- Rescuer selection is based on current geographic data and eligibility criteria.
- WebSockets are authenticated and authorized.
- Assignment handles concurrency correctly.
- Clinical access is restricted.

## Performance

- Frequent queries have suitable indexes.
- Cursor pagination works with stable ordering.
- In-memory joins use appropriate data structures.
- Performance claims are supported by measurements or query-plan analysis.

## Operations

- The Prisma client is generated reproducibly.
- Migrations preserve data.
- Dockerfiles use the correct entry point.
- Redis and PostgreSQL have appropriate configuration and health checks.
- The API produces structured health responses.
- Validation commands are documented.

---

# 18. COMMANDS, DOCUMENTATION, AND FINAL DELIVERABLE

After the changes, use the scripts that actually exist in the project and add only those that are necessary.

Check commands equivalent to:

```bash
pnpm install --frozen-lockfile
pnpm --filter <actual-api-package-name> exec prisma generate
pnpm --filter <actual-api-package-name> exec tsc --noEmit
pnpm --filter <actual-api-package-name> lint
pnpm --filter <actual-api-package-name> test
pnpm --filter <actual-api-package-name> build
```

Adapt them to the existing script structure. Do not invent package names or assume that every command is configured.

If API compilation depends on specific TypeScript configuration, use the project's actual mechanism rather than imposing an incompatible command.

Create or update technical documentation explaining:

- Implemented architecture.
- Module responsibilities.
- Dependency direction.
- Main use cases.
- Redis configuration.
- Cache policies.
- Idempotency.
- Location strategy.
- WebSocket events.
- Health checks.
- Migrations and reference data.
- Environment configuration.
- Execution commands.
- Tests.
- Known limitations.
- Secret rotation, where applicable.

Update `.env.example` with required variable names, fictitious values, and clear descriptions. Do not expose real values.

## Mandatory format for the final response

When implementation is complete, present a technical report containing:

1. **Executive summary:** what was actually implemented.
2. **Final architecture:** how the layers relate and which boundaries were enforced.
3. **12-module matrix:** completed changes, relevant files, and pending items.
4. **Redis:** caching, TTL, idempotency, geolocation, and failure recovery.
5. **Security:** fixed issues and implemented access controls.
6. **Database:** migrations, constraints, indexes, and transactional strategy.
7. **Emergencies:** snapshot, idempotency, Haversine, assignment, and WebSockets.
8. **Tests:** commands actually executed and results.
9. **Build and Docker:** commands executed and observed results.
10. **Compatibility:** preserved contracts and unavoidable changes.
11. **Main files changed:** objective list and rationale.
12. **Pending items:** only what was not resolved, with the reason and required action.
13. **Execution instructions:** reproducible commands for development and validation.

Do not present a list of planned changes as though they had been performed.

Do not claim that all tests passed without running the corresponding suite.

Do not consider the backend production-ready merely because the build completed.

The deliverable must be based on real code, preserved data, verifiable architecture, tests, and acceptance criteria.

**Start now by inspecting the repository in full and implement the changes in phases, applying all the instructions above to the actual Vitare 2026 backend.**

# MASTER PROMPT — COMPLETE ARCHITECTURAL RECONSTRUCTION OF THE VITARE 2026 FRONTENDS

## 1. IDENTITY, RESPONSIBILITIES, AND TASK OBJECTIVE

Act simultaneously as:

- **Senior Software Architect**, specializing in Clean Architecture, Domain-Driven Design (DDD), SOLID, modular architecture, and distributed systems.
- **Senior Frontend Engineer**, specializing in React, TypeScript, Vite, Single Page Applications (SPAs), feature-oriented architecture, and clinical interfaces.
- **Software Engineer specializing in PWA and offline operation**, with experience in Service Workers, IndexedDB, Dexie, resilient synchronization, local Outbox, and intermittent connectivity.
- **Frontend–Backend Integration Engineer**, specializing in HTTP contracts, REST APIs, authentication, error handling, TanStack Query, caching, and state synchronization.
- **Application Security Engineer**, experienced in role- and resource-based access control, protection of clinical information, session isolation, credential management, and web application security.
- **Engineer specializing in emergency systems**, experienced in geolocation, idempotency, clinical snapshots, operational states, real-time updates, and reconciliation of offline operations.
- **Software Quality Engineer**, responsible for unit tests, integration tests, E2E tests, typecheck, lint, reproducible builds, and validation of complete flows.
- **Accessibility and User Experience Engineer**, responsible for preserving the existing visual identity, ensuring consistent navigation, accessibility, operational feedback, and predictable interface behavior.

Your task is to **analyze, refactor, fix, and directly complete the existing frontends of the Vitare 2026 project**, applying Clean Architecture, pragmatic DDD, SOLID principles, strict typing, consistent backend integration, secure offline operation, and the other improvements described in this document.

The work must cover both applications:

- `apps/web`: patient-facing frontend.
- `apps/web-staff`: operational frontend for monitoring and rescue professionals.

Both applications consume the existing API in `apps/api`, implemented with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

Do not limit yourself to presenting a theoretical architecture, suggesting folders, or providing isolated examples. Inspect the real repository, modify the necessary files, implement features, fix the inconsistencies found, run the available checks, and present concrete evidence of the work performed.

The goal is not merely to make the frontends compile. The result must provide a coherent architecture, compatible integration contracts, explicit presentation rules, appropriate protection of clinical information, consistent caching, reliable synchronization, useful tests, and maintainability.

**Do not claim that a feature has been implemented or validated unless corresponding code and evidence consistent with the claim exist.**

---

## 2. PROJECT CONTEXT AND INTEGRATION CONTRACT

Vitare 2026 is a pnpm-managed monorepo. Its relevant components include:

- `apps/web`: React + Vite application used by the patient.
- `apps/web-staff`: React + Vite application used by professionals.
- `apps/api`: NestJS API responsible for business rules, persistence, authentication, authorization, and clinical operations.
- `infra/local`: local infrastructure and Docker configurations.
- `infra/public`: configurations used for public deployment.
- `prisma/`: Prisma schema, migrations, reference data, and catalog-loading mechanism, according to the repository's actual organization.

The backend uses PostgreSQL as its persistent source of truth and provides for Redis for caching, distributed coordination, complementary idempotency, and geolocation-related operations.

Reference data for medications and diseases already exists in `.json` files inside `prisma/data/`, and the project has a loading mechanism through `seed.ts`.

The frontend uses React, Vite, TypeScript, and the components, libraries, and conventions already present in the repository. The operational application uses TanStack Query for HTTP queries and remote-state management, according to the existing implementation.

The emergency module already has the endpoint:

`POST /api/v1/emergency/trigger`

The backend also has, or is being prepared to have, persistence of a Clinical Snapshot in JSONB, persistent idempotency, emergency operations, synchronization mechanisms, and real-time operational communication over WebSocket/Socket.IO.

**All exact contracts must be confirmed in the actual code.** The examples in this prompt specify requirements and intent, but do not authorize inventing endpoints, parameters, Socket.IO events, DTOs, or field names that do not exist in the system or have not been defined by the backend contract.

### 2.1. Mandatory integration principle

The architecture must clearly separate:

- **Frontend:** visual experience, navigation, presentation state, input validation, API calls, local cache, offline operation, and synchronization of operations.
- **Backend:** definitive authentication, effective authorization, business rules, authoritative clinical validation, persistent idempotency, operational selection, transactions, and persistence.
- **PostgreSQL:** persistent source of truth for business data.
- **Redis:** backend internal infrastructure, according to the responsibilities actually implemented.
- **Reference JSON files:** sources used by the seed process to load catalogs into PostgreSQL.
- **IndexedDB/Dexie:** controlled local storage for previously synchronized data, clinical projections required by the PWA, and pending client operations.
- **Service Worker:** installation mechanism, static-resource caching, and network strategies authorized by the security policy.

Do not turn the frontends into a second implementation of the backend.

Do not implement definitive clinical rules exclusively on the client.

Do not allow the frontend to access PostgreSQL, Redis, or the Prisma client directly.

---

## 3. ABSOLUTE CONSTRAINTS

The following constraints are mandatory.

1. Do not rewrite the applications from scratch.
2. Do not remove existing features without a documented technical need.
3. Do not change the visual identity, colors, layout, typography, visual components, branding, or navigation pattern without an explicit request.
4. Do not replace React with another framework.
5. Do not migrate the frontend to Next.js. The project uses React + Vite.
6. Do not replace pnpm with npm, Yarn, or another package manager without a justification and coordinated migration.
7. Do not replace TanStack Query with another remote-state mechanism without a proven need.
8. Do not create a second implementation of API modules inside the browser.
9. Do not connect the frontend directly to PostgreSQL or Redis.
10. Do not import JSON files from `prisma/data/` directly to simulate catalog queries at runtime. The application's data source must follow the existing JSON, `seed.ts`, PostgreSQL, API, and backend-cache flow.
11. Do not recreate existing fields, entities, endpoints, or tables under different names without a technical justification.
12. Do not silently change HTTP contracts, response formats, business states, or fields used by consumers.
13. Do not introduce dependencies incompatible with versions in `pnpm-lock.yaml`.
14. Do not remove PWA features, IndexedDB caching, offline operation, or existing synchronization flows.
15. Do not store access tokens, refresh tokens, passwords, or reusable credentials in IndexedDB.
16. Do not treat offline data as confirmation of server persistence.
17. Do not treat `navigator.onLine` as proof that the API is available.
18. Do not use fictitious clinical data as if it were official medical information.
19. Do not present invented clinical guidance as medical recommendations.
20. Do not allow the client to change its own access role through a payload, form, or local storage.
21. Do not consider hidden buttons or hidden routes to be a security mechanism.
22. Do not transmit complete Clinical Snapshots through indiscriminate broadcasts.
23. Do not leave important implementations as pseudocode, `TODO` comments, empty methods, or simulated responses.
24. Do not declare tests passed without running them.
25. Do not mark the project production-ready merely because the build completed.
26. Do not stop working after producing a plan.
27. Do not request confirmation at every phase. Inspect the code, make well-founded technical decisions, and proceed, recording actual limitations.

When a feature depends on an endpoint, event, field, or backend mechanism that does not yet exist, do not invent a contract to make it appear complete. Identify the dependency, implement the parts compatible with existing contracts, and precisely record what must be completed in the backend.

---

## 4. PHASE ZERO — MANDATORY INVENTORY AND DIAGNOSTICS

Before changing files, systematically inspect the monorepo.

Examine at least:

### 4.1. Workspace and configuration

- The root `package.json`.
- `pnpm-workspace.yaml`.
- `pnpm-lock.yaml`.
- `apps/web/package.json`.
- `apps/web-staff/package.json`.
- `vite.config.*` for both applications.
- TypeScript configurations for each frontend.
- ESLint configurations.
- Build configurations.
- Environment files and their examples.
- `.gitignore` and `.dockerignore`.
- Dockerfiles and Compose files used by local and public environments.

Confirm the actual versions of React, TypeScript, Vite, TanStack Query, Dexie, `vite-plugin-pwa`, Socket.IO Client, form libraries, visual components, and other dependencies.

Do not assume that a library is installed merely because it appears in this prompt.

### 4.2. Routes and pages

Examine:

- All routes in both applications.
- Authentication and authorization guards.
- Shared layouts.
- Sidebars, headers, footers, and menus.
- Login and registration screens.
- Password recovery and reset.
- Google authentication flow.
- Profile pages.
- Medication, allergy, and chronic-condition pages.
- Contact pages.
- Emergency screens.
- Monitoring routes.
- Staff screens.
- Patient clinical-profile queries.
- Loading, error, empty-data, and offline states.

### 4.3. HTTP layer and API integration

Examine:

- Existing HTTP clients.
- Interceptors, headers, and `fetch` or Axios configuration.
- API URL prefixes and configuration.
- DTOs used by the client.
- Response types.
- Error handling.
- Session expiration and renewal.
- TanStack Query keys and caching policies.
- Pagination and filters.
- Uploads or other specific operations, if present.
- Use of `credentials`, cookies, and CSRF protection mechanisms where applicable.
- Endpoints actually used in `apps/api`.
- Correspondence between API response data and fields accessed by components.

### 4.4. Architecture and internal dependencies

Examine:

- Current organization by modules or features.
- Shared services, hooks, and components.
- Domain types and DTOs.
- Duplicated rules across pages.
- Circular dependencies.
- Oversized components.
- Services responsible for multiple features.
- Direct imports between modules.
- Existing tests.
- File naming and organization conventions.

### 4.5. PWA, caching, and offline operation

Examine:

- `vite-plugin-pwa` configuration or the existing PWA solution.
- Service Worker registration.
- Cache strategies.
- Previously cached resources.
- IndexedDB structure.
- Use of Dexie, if already installed.
- TanStack Query cache.
- Synchronization rules.
- Operations that can occur offline.
- Handling of resubmissions after network failures.
- Data isolation after logout and user switching.
- Expiration and invalidation of local clinical data.
- Persistence of pending emergencies.

### 4.6. Operational staff application

Pay particular attention to:

- `apps/web-staff/components/staff-emergencies-feed.tsx`.
- The hook or service that supplies the feed.
- The TanStack Query key used by the feed.
- The HTTP query for recent emergencies.
- Refresh intervals.
- Display of incident states.
- Use of the clinical snapshot returned by the API.
- `LocationMap` and geographic components.
- Display of patient identifiers.
- Clinical-query routes.
- Access controls.
- Operational updates over HTTP, polling, or WebSocket.

### 4.7. Traceability matrix

Build a work matrix containing:

1. Requirement.
2. Affected application.
3. Existing files and components.
4. Related backend contract.
5. Required change.
6. Required test or evidence.
7. Completion status.

The actual inspection must guide implementation. Do not reorganize all code merely to reproduce an idealized folder tree literally.

---

# 5. TARGET ARCHITECTURE — CLEAN ARCHITECTURE, DDD, AND SOLID IN THE FRONTEND

Implement a modular architecture organized around Vitare's functional domains, using Clean Architecture and pragmatic DDD.

The architecture must separate domain rules, use cases, infrastructure adapters, and presentation.

The abstraction level must be proportional to existing rules. Do not create artificial classes, interfaces, or factories for trivial operations.

## 5.1. Reference structure

Adapt the structure below to the actual organization of the applications:

```text
apps/
├── web/
│   └── src/
│       ├── app/
│       │   ├── router/
│       │   ├── providers/
│       │   └── configuration/
│       │
│       ├── modules/
│       │   ├── auth/
│       │   ├── patients/
│       │   ├── medications/
│       │   ├── medications-dictionary/
│       │   ├── allergies/
│       │   ├── conditions/
│       │   ├── disease-dictionary/
│       │   ├── contacts/
│       │   ├── forbidden-medications/
│       │   ├── emergency/
│       │   ├── staff/
│       │   └── health/
│       │
│       ├── offline/
│       │   ├── database/
│       │   ├── clinical-snapshot/
│       │   ├── outbox/
│       │   └── synchronization/
│       │
│       └── shared/
│           ├── api/
│           ├── authentication/
│           ├── errors/
│           ├── hooks/
│           ├── lib/
│           ├── types/
│           └── ui/
│
└── web-staff/
    └── src/
        ├── app/
        ├── modules/
        │   ├── auth/
        │   ├── patients/
        │   ├── emergency/
        │   ├── staff/
        │   └── health/
        │
        └── shared/
            ├── api/
            ├── authentication/
            ├── errors/
            ├── hooks/
            ├── lib/
            ├── types/
            └── ui/
```

This structure is a guideline, not an obligation to use particular names or paths. Reuse existing components and conventions when technically appropriate.

The 12 modules define the functional domains that must be covered; they do not require every feature to be repeated in both applications when a module belongs exclusively to one frontend.

## 5.2. Domain Layer

The domain layer must contain only concepts with actual business meaning:

- Domain types.
- Value Objects justified by invariants.
- State rules.
- Local validation policies.
- Domain error types.
- Models independent of visual components.
- Consistency rules required for local execution.
  Examples of concepts that may justify explicit models include: patient identity, medication in use, medication restriction, clinical snapshot, and pending emergency operation.

The domain layer must not import:

- React.
- TanStack Query.
- Visual components.
- Browser-specific APIs without an adapter.
- Presentation DTOs indiscriminately.
- Prisma-generated types.
- Redis.
- NestJS classes or internal modules.

Do not turn every property of an object received from the API into a Value Object without a concrete benefit.

## 5.3. Application Layer

The application layer coordinates frontend use cases, for example:

- `SignInUseCase`.
- `GetPatientProfileUseCase`.
- `AddMedicationUseCase`.
- `UpdateAllergyUseCase`.
- `RefreshClinicalSnapshotUseCase`.
- `QueueEmergencyUseCase`.
- `SynchronizePendingEmergenciesUseCase`.
- `GetAuthorizedEmergencyDetailsUseCase`.
- `UpdateStaffAvailabilityUseCase`.

These names are examples. Use naming and abstractions appropriate to the actual project.

Use cases must:

- Receive typed inputs.
- Perform application-specific validation.
- Invoke API and local-storage contracts.
- Coordinate transitions between local and remote data.
- Produce predictable results and errors.
- Avoid direct dependencies on React components.
- Distinguish server-confirmed results from local results.
- Respect the authenticated identity and the operation context.

The application layer must not become a duplicate of the backend's authoritative business rules.

## 5.4. Infrastructure Layer

The infrastructure layer must contain the concrete implementations required by the frontend:

- HTTP clients.
- API adapters.
- Serialization and deserialization.
- Dexie storage implementations.
- Browser geolocation adapters.
- Connectivity adaptation.
- Socket.IO Client adapters, when used.
- Service Worker integration.
- Persistence and processing of the local Outbox.
- Technical handling of timeouts, cancellation, and retries.

The HTTP client must remain centralized. Do not create an independent connection for every module without justification.

**Redis, Prisma, and PostgreSQL belong to the backend infrastructure.** Neither frontend may manage connections to or query these components directly.

## 5.5. Presentation Layer

The presentation layer contains:

- Pages.
- Layouts.
- React components.
- Forms.
- UI hooks.
- Router integration.
- Feedback components.
- Tables, lists, and cards.
- Location components.
- Synchronization indicators.
- Interaction between use cases and the interface.

Components must not concentrate arbitrary HTTP calls, duplicated clinical rules, complex synchronization logic, and authorization decisions.

Prefer a division in which the component presents data and forwards actions to cohesive hooks, application services, or adapters.

## 5.6. Dependency direction

Ensure that:

- The domain does not depend on React.
- The application depends on contracts.
- Infrastructure implements the contracts consumed by the application.
- Presentation uses appropriate use cases and adapters.
- Offline synchronization logic is not distributed across different components.
- The HTTP layer is shared consistently within each application.
- Dependencies between `apps/web` and `apps/web-staff` are not introduced artificially.

If the monorepo already has a suitable shared package, consider reusing compatible types and utilities. Do not create a new workspace package solely for aesthetic organization.

Do not indiscriminately share visual components if doing so would require changing either application's visual identity.

## 5.7. Applying SOLID principles

**SRP:** each component, hook, service, or class must have a cohesive responsibility.

**OCP:** new adapters and synchronization strategies must be integrated without continually rewriting core logic.

**LSP:** alternative storage and transport implementations must respect existing contracts.

**ISP:** contracts must contain only the operations required by consumers.

**DIP:** application rules must not depend directly on concrete implementations of IndexedDB, HTTP, or Socket.IO.

Apply these principles through useful separation of responsibilities. Do not multiply interfaces, classes, and files without a maintenance or testing benefit.

## 5.8. Typing and data models

Explicitly distinguish:

- Domain models.
- API input DTOs.
- API response DTOs.
- Presentation projections.
- Records persisted in IndexedDB.
- Operations pending synchronization.
- Derived data, such as a precomputed clinical snapshot.

Do not treat a TypeScript object as validated merely because it has a type annotation.

Validate external data at the application boundary when necessary, especially API responses, older IndexedDB records, and payloads recovered from an offline queue.

Avoid `any`, unnecessary type coercions, and chains of casts that hide contract inconsistencies.

---

# 6. HTTP CONTRACTS, AUTHENTICATION, AND FRONTEND CACHE

## 6.1. Centralized HTTP client

Audit the current HTTP client before creating or modifying another one.

Standardize, when compatible with the existing implementation:

- Base URL.
- `/api/v1` prefix.
- Common headers.
- Cookie and credential handling.
- Timeout.
- AbortController.
- Serialization.
- Deserialization.
- Error handling.
- Session renewal.
- Redirection when authentication expires.
- Request correlation, if the backend has a trace mechanism.

Do not duplicate interceptors or the same authentication logic across every module.

Do not hardcode absolute production URLs in source code. Use the actual environment configuration.

## 6.2. DTO and response compatibility

For each endpoint used:

1. Locate the backend's actual contract.
2. Identify DTOs, parameters, responses, and errors.
3. Identify the fields actually used by the frontend.
4. Fix name and type discrepancies.
5. Preserve compatibility with existing flows.
6. Create or adjust tests for relevant mappers.

Do not invent responses to work around missing fields.

If the backend changes a required contract, identify the dependency and propose a coordinated evolution. Do not silently modify multiple consumers based on an assumption.

## 6.3. Error handling

Implement a consistent representation of errors, respecting the API's actual formats.

Distinguish, where applicable:

- Validation failure.
- Authentication failure.
- Authorization failure.
- Missing resource.
- State conflict.
- Blocking clinical restriction.
- Timeout.
- Connection failure.
- Invalid response.
- Internal error.
- Temporary unavailability.

Present messages that users can understand without exposing stack traces, internal configuration, or sensitive details.

Do not convert all failures into generic messages that prevent users from knowing whether an operation was saved, rejected, or is still pending.

## 6.4. TanStack Query

Preserve TanStack Query as the remote-state management mechanism wherever it is already installed and used.
Organize:

- Query keys.
- Query hooks.
- Mutations.
- Invalidation.
- Revalidation.
- Pagination.
- Request cancellation.
- Loading states.
- Error states.
- Handling of stale data.

Query keys for private information must account for identity and session context when necessary to prevent data reuse between users.

After logout or a user switch, remove from the in-memory cache private data that must not remain accessible to the new session.

Do not cache entire medical records or sensitive lists indefinitely for convenience.

Do not declare a query up to date merely because a previously cached TanStack Query result exists.

## 6.5. Mutations and consistency

Optimistic updates may be used only when there is a safe rollback and reconciliation strategy.

For critical operations, such as emergency triggering, do not replace server confirmation with an optimistic update that appears definitive.

Clearly distinguish:

- Locally prepared operation.
- Operation waiting for synchronization.
- Request sent.
- Request confirmed by the server.
- Rejected operation.
- Operation with an unknown outcome after a timeout.

When a request fails after being sent, determine the state using the idempotency semantics and API contract instead of assuming that the operation did not execute.

---

# 7. THE 12 MODULES AND THEIR FRONTEND RESPONSIBILITIES

The 12 modules below must be implemented or refactored in alignment with the corresponding backend modules.

## MODULE 1 — AUTH: AUTHENTICATION, IDENTITY, AND SESSION CONTROL

Implement or refactor authentication integration in both frontends, preserving existing flows.

### Responsibilities

- Patient login.
- Patient registration.
- Authenticated session.
- Password recovery and reset.
- Google login, when configured.
- Logout.
- Session-expiration handling.
- Session renewal, according to the backend's actual contract.
- Redirects after authentication.
- Visual route protection.
- Identification of the authenticated user.
- Integration with the `PATIENT`, `MEDIC_STAFF`, `RESCUER_STAFF`, and `ADMIN` roles, according to the backend.

### Mandatory requirements

Audit the actual flows before modifying components.

If the backend uses `HttpOnly` cookies, the frontend must respect this model and must not try to read tokens through JavaScript. Implement credential configuration and CSRF protection when applicable to the contract.

If the current mechanism uses another session pattern, do not silently replace it with one that interrupts production flows.

Do not store refresh tokens or reusable credentials in IndexedDB.

Do not use the presence of data in the local cache as proof that the session remains valid.

Do not allow forms, parameters, or local storage to assign privileges to users. Roles are defined by the backend.

### Staff registration

Preserve the existing navigation and monitoring, login, and registration screens when they are part of the system.

However, the frontend must not offer an unrestricted flow capable of creating privileged accounts without authorization. The staff-registration screen must follow the backend's actual provisioning mechanism, such as a validated invitation, administrative flow, or controlled bootstrap.

Do not expose a free-form role selector that allows any visitor to choose `MEDIC_STAFF`, `RESCUER_STAFF`, or `ADMIN`.

When the backend indicates that initial provisioning is unavailable or an invitation is invalid, show a consistent state without pretending registration was completed.

### Acceptance criteria

- Login, logout, and expiration work according to the API.
- Users cannot visually access routes incompatible with their session.
- Authentication failures are handled without redirect loops.
- Switching users does not reuse private cached data.
- The Google flow preserves configured callbacks and URLs.
- No privileged role can be unilaterally assigned by the client.

---

## MODULE 2 — PATIENTS: PROFILE AND MEDICAL-RECORD COORDINATION

Implement or refactor the interface and services responsible for the patient's profile and display of aggregated clinical information.

### Responsibilities

- Retrieve the user's own profile.
- Update authorized demographic fields.
- Display basic patient data.
- Display information from the clinical modules.
- Assemble the medical-record view using medication, allergy, condition, and contact data.
- Display the data synchronization status.
- Maintain local projections required by the PWA.
- Respect the origin and update timestamp of displayed data.

### Backend integration

The patients module coordinates information, but the clinical modules remain responsible for their own data.

Consume existing endpoints and projections. Do not query the database directly or replicate the clinical aggregate in the frontend as if it were the source of truth.

Do not assume every medical-record query returns the same data to a patient, professional, rescuer, and administrator.

### Offline operation

The frontend may provide previously synchronized data according to the cache and authorization policy.

Whenever it displays clinical information offline or potentially out of date, indicate that condition using a visual mechanism consistent with the existing design.

Distinguish between:

- Data recently retrieved from the server.
- Previously synchronized local data.
- Locally changed data not yet sent.
- Data whose update could not be confirmed.

Do not present a local projection as a definitively up-to-date clinical record.

### Acceptance criteria

- The profile is displayed with the data specified by the contract.
- Partial updates preserve omitted fields.
- Users cannot modify protected fields.
- Medical records do not mix information from different identities.
- Offline information indicates its status.
- Failure of a dependent endpoint is not masked by fabricated results.

---

## MODULE 3 — MEDICATIONS: PATIENT MEDICATIONS

Implement or refactor the interface for managing medications associated with the medical record.

### Responsibilities

- Retrieve active medications.
- Add a medication from the catalog.
- Edit permitted treatment data.
- Retrieve details of the medication associated with the patient.
- Record dosage, frequency, and dates when provided by the model.
- End or deactivate use according to the domain.
- Display loading, error, and update states.
- Display incompatibility alerts according to the backend contract.

### Preserve `frequency`

Preserve `frequency` to represent the periodicity of medication use.

**Do not reintroduce `schedules`, entities, pages, or structures previously removed to represent periodicity.**

Before modifying forms, interfaces, or types, check how `frequency` is represented in the API and current model.

Do not invent frequency values, dosages, therapeutic indications, or medical advice.

### Clinical restrictions

The frontend may perform local pre-validation for fast feedback, but these checks are auxiliary.

The backend remains the authority for preventing additions or updates of medications incompatible with formally registered restrictions.

If the server rejects an operation because of a clinical restriction:

- Do not show success.
- Do not preserve an optimistic update as if it were valid.
- Present an understandable explanation based on the response allowed by the API.
- Reconcile remote and local state.
- Preserve form data when doing so is safe and useful to the user.

Do not implement drug-interaction rules that do not exist in the backend.

### Local pre-validation algorithm

When needed to optimize the interface, build associative indexes using `Map` with canonical medication and active-ingredient identifiers supplied by existing contracts.

To cross-reference active medications with known restrictions, prefer building the index once and reusing it rather than performing repeated linear searches inside nested loops.

Describe complexity correctly:

- Building the index generally costs O(N).
- Looking up a key in `Map` has average O(1) cost.
- Cross-referencing M medications with a previously built index tends to cost O(M), excluding additional transformation costs.
- Total cost depends on index construction, data volume, and the actual comparison rules.
  Do not claim that every query or comparison is O(1).

These local checks do not replace backend validation and blocking.

### Acceptance criteria

- The selected medication correctly references the catalog.
- Frequency is preserved without information loss.
- Operations blocked by the backend do not remain as local successes.
- Clinical restrictions are displayed without unsupported inferences.
- No parallel `schedules` module exists.
- Local state is reconciled after mutations or failures.

---

## MODULE 4 — MEDICATIONS-DICTIONARY: MEDICATION CATALOG

Implement or refactor search and selection of reference medications.

### Data source

The catalog already has `.json` files in `prisma/data/`, loaded into PostgreSQL by `seed.ts`.

The frontend must consume the catalog through the API's actual endpoints.

The conceptual flow is:

`Reference JSON → seed.ts → PostgreSQL → NestJS API → frontend`

Redis is a cache layer managed by the backend and is not part of the client connection.

**Do not import JSON files from `prisma/data/` directly into the frontend to replace the API.**

Do not create a second medication catalog in the code of `apps/web` or `apps/web-staff`.

### Responsibilities

- Search for medications using fields supported by the contract.
- Select reference records.
- Debounced search when appropriate.
- Pagination or progressive loading according to the API.
- Cancellation of outdated queries.
- Handling of empty results.
- Display of errors and unavailability.
- Controlled local caching of permitted results.

Do not assume that all search modes, synonyms, and active ingredients are available. Examine the actual structure and existing endpoints.

### Caching

The backend uses Cache-Aside with a normal 24-hour TTL for reference queries covered by that policy.

This does not mean that the frontend's local cache must remain valid for 24 hours without regard to changes in the remote source.

Define the local policy according to the data type, version, headers, and responses actually available.

When the backend updates the catalog, the frontend must be able to obtain new data without depending indefinitely on an old copy.

### Acceptance criteria

- Search uses the actual API.
- Selection references the correct persistent identifiers.
- The frontend does not duplicate the catalog data source.
- Old queries do not overwrite newer results.
- Pagination works according to the contract.
- API unavailability does not produce fictitious results.

---

## MODULE 5 — ALLERGIES: PATIENT ALLERGIES

Implement or refactor the screens and services for managing allergies.

### Responsibilities

- List the patient's allergies.
- Add allergies.
- Update permitted information.
- Deactivate or remove records according to the domain.
- Display the related substance or agent, when available.
- Present fields actually supported by the backend.
- Integrate the information into the medical-record view and clinical snapshot.

### Presentation rules

Distinguish allergies, preferences, adverse effects, and administrative restrictions according to the existing data.

Do not invent severity classifications or equivalences between substances.

When the API provides a canonical reference to a medication or active ingredient, preserve that association.

Validation of clinical restrictions remains the backend's responsibility.

### Acceptance criteria

- Operations use existing contracts.
- Allergies are associated with the correct patient.
- The frontend does not turn a failure into an empty list that suggests there are no allergies.
- Changes are reflected in the medical record and local projections after synchronization.
- Private information is not shared between sessions.
- Historical snapshots are not changed by subsequent updates.

---

## MODULE 6 — CONDITIONS: PATIENT CHRONIC CONDITIONS

Implement or refactor the interfaces for long-term health conditions.

### Responsibilities

- Retrieve recorded conditions.
- Add a condition from the existing catalog.
- Update permitted fields.
- End or deactivate records according to the model.
- Retrieve descriptive information from the dictionary.
- Display conditions in the medical record.
- Update the local clinical projection after confirmed changes.

A patient's individual condition is a clinical association. The master catalog is a shared reference source.

Do not allow a change to an individual note to modify the catalog description.

Do not invent diagnoses, official codes, classifications, or medical advice.

### Mandatory route

Preserve the route:

`/doencas-cronicas`

This route must remain independent of `/minha-saude/doencas-cronicas`.

Do not silently change the existing path or create redirects that break current links.

### Acceptance criteria

- Conditions are retrieved and persisted through the API.
- The catalog is consumed through the reference module.
- Offline updates are identified as pending when permitted.
- The frontend distinguishes absence of conditions from a loading failure.
- Records remain associated with the correct patient.

---

## MODULE 7 — DISEASE-DICTIONARY: DISEASE AND CONDITION CATALOG

Implement or refactor search and selection of cataloged conditions.

The existing source consists of reference JSON files in `prisma/data/`, the seed mechanism, and records persisted in PostgreSQL.

The frontend must not import this dataset directly to act as an independent database.

### Responsibilities

- Query conditions through available endpoints.
- Display names, codes, descriptions, and other fields returned by the API.
- Search using parameters actually supported.
- Paginate results where applicable.
- Handle empty results and unavailability.
- Use local caching with an explicit update policy.

Do not invent official codes or descriptions.

Do not assume that a catalog update automatically updates individual clinical associations unless the API confirms that behavior.

### Acceptance criteria

- Selection uses valid catalog identifiers.
- Data origin follows the existing flow.
- There is no parallel data source in the frontend.
- The cache does not indefinitely conceal catalog updates.
- The search component preserves the established visual experience.

---

## MODULE 8 — CONTACTS: EMERGENCY CONTACTS

Implement or refactor the interface for managing family members, guardians, and emergency contacts associated with the patient.

### Responsibilities

- List contacts.
- Add contacts.
- Edit permitted data.
- Update relationship information.
- Remove or deactivate records according to the contract.
- Display contact priority when provided by the domain.
- Make telephone numbers and other contact methods available according to existing data.
- Integrate contacts into the clinical projection and local snapshot.

### Validation and security

Validate inputs consistently with the data accepted by the API.

Do not consider browser-side telephone validation confirmation that the number belongs to the person.

Do not expose third-party contacts outside authorized contexts.

The frontend must not decide by itself that a contact should receive an emergency notification. That decision belongs to the backend and the system rules.

### Acceptance criteria

- Operations respect ownership and authorization.
- Information is updated after confirmation.
- The local cache is invalidated appropriately.
- Contacts are incorporated into clinical projections according to the defined policy.
- No contact is invented to fill missing data.

---

## MODULE 9 — FORBIDDEN-MEDICATIONS: DISPLAY AND VERIFICATION OF MEDICATION RESTRICTIONS

Implement or refactor the interface integration with the medication-restrictions module.

This module must preserve the distinction between individual restrictions and the master medication catalog.

### Reference source

The frontend must consume the data and operations exposed by the backend.

Existing JSON files in `prisma/data/` are reference sources for the loading process when they correspond to the actual model. The backend uses `seed.ts` and PostgreSQL to provide this data to the application.

Do not create a second catalog-import process in the frontend.

### Responsibilities

- Query restrictions available to the authenticated patient.
- Present information authorized by the backend.
- Associate restrictions with canonical references when the contract provides those identifiers.
- Allow management operations only when they are supported and authorized.
- Update local clinical projections.
- Integrate queries into the medication-addition and editing flow.

### Verification and performance

When useful, the frontend may create `Map` indexes by canonical identifiers to optimize the presentation of local alerts and warnings.

Do not perform joins based exclusively on textual name comparisons if the backend provides reliable references.

Do not invent equivalences between medications or active ingredients.

Local pre-validation may warn the user, but the backend must check blocking restrictions before persistence.

If the backend rejects an addition because of a clinical restriction, the interface must display the error permitted by the contract and revert any optimistic update.

**Definitive blocking must remain in the backend.** Hiding or disabling a button is not a sufficient security mechanism.

### Acceptance criteria

- Restrictions are retrieved from the API.
- The patient's context is respected.
- The frontend does not assume clinical authority that belongs to the backend.
- Blocking operations are not displayed as completed.
- Local indexes are invalidated after changes.
- Catalog-loading mechanisms are not duplicated.

---

## MODULE 10 — EMERGENCY: EMERGENCY TRIGGERING, CLINICAL SNAPSHOT, AND OFFLINE OPERATION

This is one of the most critical modules in the entire frontend.

Implement or refactor the emergency flow to be resilient to network failures, browser interruptions, delayed responses, and duplicate requests.

The interface must remain compatible with the existing endpoint:

`POST /api/v1/emergency/trigger`

Preserve the backend's actual contracts, including payload, fields, response format, and operational states.

### 10.1. Online flow

When connectivity is available, the frontend must:

1. Identify the authenticated patient.
2. Validate that the operation can be performed in the session context.
3. Obtain the location, if permitted and available.
4. Prepare the local data required by the trigger contract.
5. Create a stable idempotency key for that operation.
6. Send the request using the existing endpoint and fields.
7. Wait for server confirmation.
8. Update the presentation state according to the response.
9. Reconcile remote and local data.
10. Show the user the operation's true status.

If the server composes the snapshot by querying persisted clinical data, preserve that behavior.

If the contract allows submitting a local snapshot, respect the actual structure, version, and validation rules. Do not replace server-confirmed data with a local snapshot unless the contract authorizes it.

### 10.2. Client-side idempotency

The backend requires, or must require, `X-Idempotency-Key` for emergency triggering, according to the contract defined in the project.

The frontend must:

- Generate a unique key for each new logical operation.
- Persist the key alongside the pending operation.
- Reuse the same key when retrying the same operation after a timeout or connection failure.
- Keep the same key while the original operation is still being reconciled.
- Not generate a new key for every send attempt of the same operation.
- Not reuse the same key for a different payload.
- Avoid creating duplicate operations due to re-renders, repeated clicks, or reopening the application.

The key must survive application restarts while the operation remains pending.

Do not generate the key only inside the click handler if a repeated click could cause two logically identical operations with different identifiers.

### 10.3. Persistent local Outbox

Implement a client-side Outbox, preferably using the existing Dexie/IndexedDB structure or a compatible extension of current storage.

Do not keep the critical queue exclusively in memory.

Each pending operation must have, according to the actual design:

- Local identifier.
- Patient or operation-owner identifier.
- Idempotency key.
- Validated payload.
- Applicable schema version.
- Local creation time.
- Synchronization state.
- Attempt count.
- Date of the last attempt.
- Information required for reconciliation.
- Classified error, when applicable.

Recommended local states:

- `QUEUED`: operation persisted locally and awaiting submission.
- `SYNCING`: synchronization attempt in progress.
- `SYNCED`: server confirmed the operation.
- `RETRY_WAIT`: recoverable failure, awaiting another attempt.
- `FAILED_PERMANENT`: failure that cannot be recovered without intervention.

These are client processing states. They must not be confused with the official emergency states maintained by the backend.

If equivalent local states already exist, preserve them or implement a compatible local migration.

### 10.4. Local atomicity

Whenever possible, persist the operation and all indispensable local data within an IndexedDB transaction.

A browser crash must not produce a situation in which the interface claims an emergency is queued when the required payload was not stored.

Local persistence does not guarantee that the server received the operation. It guarantees only that the browser managed to record the pending work in its own storage.

### 10.5. Resilient synchronization

Implement a centralized synchronization mechanism that:

- Finds pending operations.
- Verifies the identity to which each operation belongs.
- Avoids concurrent submissions of the same operation.
- Uses the same idempotency key on retries.
- Classifies transient and permanent errors.
- Uses exponential backoff with jitter for recoverable failures.
- Establishes attempt limits or an explicit continuation policy.
- Respects timeouts.
- Avoids retry loops that continuously consume resources.
- Persists the result of each attempt.
- Reconciles the server response with the local queue.
- Preserves pending operations across restarts.

Consider these scenarios:

- Device offline before submission.
- Disconnection during the request.
- Timeout after the server may already have persisted the emergency.
- Lost response.
- Temporary server error.
- Expired session.
- Payload rejected by validation.
- Idempotency-key conflict.
- User closes or restarts the application.
- Failure to update IndexedDB.
- Operation already processed but still considered pending by the client.

Interpret a successful HTTP response according to the actual contract. A timeout does not necessarily mean the server did not process the operation.

When a response confirms permanent rejection, stop automatic retries that cannot correct the payload.

When the session has expired, handle authentication consistently without silently losing the local operation.

### 10.6. `navigator.onLine` is not proof of connectivity

Use connectivity events only as signals to start an attempt or update the interface.

The application must treat the network as a dependency that can fail at any time.

Even if `navigator.onLine` indicates a connection, the backend may be unavailable.

Even if one endpoint works, another required service may be degraded.

Confirmation depends on the actual result of the backend request.

### 10.7. States shown to the user

The interface must distinguish, for example:

- Emergency recorded only locally.
- Emergency awaiting synchronization.
- Submission in progress.
- Emergency received and confirmed by the server.
- Emergency received, awaiting operational progress, according to the state returned by the backend.
- Recoverable failure.
- Permanent failure requiring handling.
- Location data unavailable.
- Partially outdated snapshot.

**Never present an emergency stored only on the device as if it had already been received by the server or a rescuer.**

Do not use labels such as “rescue dispatched,” “team notified,” or “professional on the way” without evidence consistent with the state returned by the API.

The `SYNCED` state confirms operation synchronization according to the backend contract; it does not necessarily mean that the incident has been resolved or that a professional has accepted the call.

The frontend must not promise assistance from SAMU, a hospital, or an external service when the corresponding integration does not exist in the backend.

### 10.8. Local Clinical Snapshot and history

Implement or refactor the local clinical projection required for offline operation.

The snapshot must be assembled from information actually available to the application and authorized for local use, such as:

- Patient identification.
- Required demographic profile.
- Active medications.
- Allergies.
- Chronic conditions.
- Emergency contacts.
- Relevant clinical restrictions, when available.
- Snapshot schema version.
- Time of the last known clinical synchronization.
- Information origin.
- Staleness indicators.

The exact fields must respect the existing contract. Do not send properties that the backend does not accept.

Distinguish server-synchronized data from local information that has not yet been confirmed.

The precomputed projection may be stored in IndexedDB and recalculated when local clinical data changes.

Do not treat it as the persistent source of truth. It must be reconstructible from available local records.

### 10.9. Snapshot immutability

An emergency snapshot is a historical representation of the context at the time defined by the flow.

After the incident is created on the server, subsequent medical-record changes must not silently rewrite the original snapshot.

The frontend must distinguish between:

- Local snapshot prepared before submission.
- Submitted payload.
- Snapshot actually persisted and confirmed by the server.
- The patient's current clinical record.

If the server returns the persisted version, use it for historical viewing.

Do not replace a confirmed historical version with a new projection assembled from the current medical record.

### 10.10. Geographic location

Use browser APIs according to available permissions.

Validate:

- Latitude between -90 and 90.
- Longitude between -180 and 180.
- Coordinate availability.
- Position timestamp.
- Accuracy, when supplied.
- Permission errors.
- Acquisition timeout.

Do not interpret missing coordinates as latitude zero and longitude zero.

Do not use stale positions as if they were current.

When location is unavailable, report this condition and follow only behavior permitted by the emergency contract.

Do not invent a substitute position.

### 10.11. Isolation of offline operations

Each pending operation must remain associated with the identity and context that originated it.

If the user logs out or switches accounts:

- Do not expose the private queue to the new identity.
- Do not automatically submit old operations as if they belonged to the newly authenticated user.
- Preserve critical pending work according to the defined recovery policy.
- Block its synchronization until the required identity has been validated.
- Allow the operation to resume only when identity, authorization, and contract requirements are met.
- Do not silently delete a pending emergency.

Clinical information in IndexedDB requires minimization, identity-based isolation, visual access control, and an expiration policy. Do not claim that IndexedDB provides data-at-rest encryption by default.

### 10.12. Client Outbox and server Outbox

Do not confuse the two mechanisms.

The client Outbox allows operations to be stored while the browser cannot send them.

The server Outbox allows recovery and publication of operational events related to persisted transactions, including when WebSocket emission fails.

One mechanism does not replace the other.

The frontend must not claim server-delivery guarantees merely because its operation was added to IndexedDB.

### 10.13. Tests and acceptance criteria

Implement tests for:

- Creation of an emergency operation.
- Generation and persistence of the idempotency key.
- Repetition of the same payload with the same key.
- Prevention of duplicates from repeated clicks.
- Local Outbox persistence.
- Application restart with pending operations.
- Online synchronization.
- Synchronization after network recovery.
- Timeout with unknown remote result.
- Retry with the same key.
- Backoff.
- Permanent rejection.
- IndexedDB failure and recovery.
- User isolation.
- Outdated snapshot.
- Missing coordinates.
- Invalid location.
- Expired session.
- Distinction between local queue and server-confirmed emergency.
- Reconciliation with the snapshot returned by the API.

The operation may be considered functional only after the cycle of local persistence, submission, idempotency, confirmation, and reconciliation has been validated.

---

## MODULE 11 — STAFF: MONITORING, EMERGENCY OPERATIONS, AND CLINICAL ACCESS

Implement or refactor the operational frontend while preserving API contracts and existing monitoring flows.

This module is responsible for presenting authorized information about professionals, incidents, location, assignment, and patients.

### 11.1. Authentication and authorization

Respect the roles and permissions defined by the backend.

The existence of a route, UUID, CPF, or emergency identifier does not grant authorization to query the resource.

The frontend must adapt navigation and action visibility to the authenticated identity, but the API remains responsible for effective authorization.

Do not attempt to bypass a `403` by hiding the message or querying another endpoint without authorization.

### 11.2. Emergency feed

Audit the existing component, especially:

`apps/web-staff/components/staff-emergencies-feed.tsx`

Preserve the current HTTP-query and TanStack Query pattern when it is correct.

The previously existing implementation uses the query key `staff-emergencies`, retrieves recent emergencies through `staffEmergenciesApi.findRecent(50)`, and uses periodic refresh at approximately 15-second intervals.

Confirm these values in the code before changing them. Do not remove functional mechanisms merely to replace polling with WebSocket.

Keep the data and states actually used by the system, including the clinical information required for operations and incident states specified by the contract.

### 11.3. Real-time communication

The backend provides for a WebSocket Gateway with Socket.IO, connection authentication, authorization, event publication after persistence, and recovery mechanisms.

When the Gateway and its contracts are implemented, integrate the Socket.IO client while respecting:

- Configured API URL.
- Connection authentication.
- Authorized roles.
- Established rooms or channels.
- Actual event names.
- Actual payload formats.
- Reconnection.
- Transport errors.
- Event deduplication.
- Connection limits and lifecycle.

Do not invent event or channel names.

Do not assume that Socket.IO events are definitive proof of persistence or of the incident's current state.

Use events as operational signals and, when necessary, invalidate TanStack Query entries and retrieve authorized data again through the REST API.

**Maintain an HTTP fallback strategy when real-time communication is unavailable or has not yet been integrated.** Do not leave the feed empty merely because a Socket.IO connection failed.

Do not open multiple connections per component or re-render. Centralize the lifecycle and clean up listeners and connections when appropriate.

### 11.4. Data transmitted by events

Do not indiscriminately transmit or store the complete clinical snapshot over WebSocket.
The event must carry only the operational data required to identify the change, according to the backend contract.

Clinical details must be retrieved through protected endpoints after the applicable authorization check.

Do not expose clinical data in browser logs, query strings, or debug messages.

### 11.5. Patient identification

The operational flow needs to correctly identify the patient associated with an incident.

Preserve the identification made available by the backend and fix existing mappings so that components use the actual response fields.

When the backend provides CPF for the authorized function and context, display it according to the existing operational requirement.

Do not produce a fictitious identifier.

Do not read a CPF from an unrelated local record merely to fill the interface.

Do not display “CPF not provided” when the actual problem is an incorrect mapping of the field or received projection.

If the endpoint does not return CPF or another required identifier, record the contract incompatibility with the backend. Do not invent the property or expose data the endpoint is not authorized to provide.

The displayed identifier must correspond to the patient associated with the incident and allow navigation to the authorized clinical view.

### 11.6. Patient clinical view

Preserve and integrate the existing operational clinical-query route, including:

`/monitoramento/pacientes`

Confirm the actual router implementation before changing parameters or paths.

The flow must allow an authorized professional to query data for the selected patient without mixing information from other identities.

According to the contract and authorization, the presentation component may display:

- Identification data.
- Active medications.
- Allergies.
- Chronic conditions.
- Emergency contacts.
- The incident's historical snapshot.
- Relevant operational information.

Do not assume that the current medical record is identical to the incident snapshot. The interface must distinguish current clinical information from the historical context captured when the emergency was triggered.

### 11.7. Location and contact

Validate how location and timestamp are received before displaying a position as current.

Do not show the last known coordinate as necessarily representing the present location.

Preserve the `LocationMap` component or its existing equivalent when functional.

For telephone numbers provided by the API and authorized for the operational flow, use `tel:` links to facilitate contact from a compatible device.

Do not invent telephone numbers or turn identifiers that are not contact numbers into call links.

### 11.8. Availability and assignment

Display states and actions according to backend contracts.

When the API allows accepting, assigning, or resolving an emergency, the interface must:

- Clearly identify the requested operation.
- Avoid repeated submissions.
- Disable controls during a mutation when appropriate.
- Display the actual response.
- Reconcile the incident after the operation.
- Handle assignment conflicts.
- Respect the assignment policy defined by the backend.

Do not assume that two people can take the same incident or that the frontend can guarantee exclusivity. The server must ensure this consistency.

### 11.9. Acceptance criteria

- The feed remains functional over HTTP.
- Socket.IO integration is based on the actual contract.
- A WebSocket failure does not make the operational interface unusable.
- Duplicate events do not visually duplicate records.
- Clinical details are retrieved through authorized endpoints.
- CPF, when authorized and provided, is mapped correctly.
- The clinical query corresponds to the selected patient.
- The interface distinguishes the historical snapshot from the current medical record.
- Displayed states match data confirmed by the backend.

---

## MODULE 12 — HEALTH: APPLICATION STATUS AND API AVAILABILITY

Implement or refactor API-availability handling in both frontends.

The backend defines operational checks to distinguish an active process, readiness, startup, and dependency failures.

Examine the existing health route and actual contracts, including compatibility with `/api/v1/health` where applicable.

Do not invent auxiliary endpoints.

### Responsibilities

- Identify connection failures.
- Distinguish device connectivity from API availability.
- Display temporary warnings when the API is inaccessible.
- Preserve authorized local data during offline conditions.
- Indicate when synchronization is pending.
- Automatically restore visual state after reconnection.
- Prevent a transient error from causing continuous redirects or reloads.

### Availability semantics

Distinguish between:

- Device with no detected connectivity.
- Inaccessible API.
- API responding to a basic check.
- API in a degraded state, according to available information.
- API ready for essential operations.
- Local operations pending.
- Operations that failed permanently.

Do not treat liveness as a guarantee that PostgreSQL, Redis, or every business feature is available.

Do not expose internal details, credentials, stack traces, or sensitive infrastructure information in the interface.

### Check frequency

Use endpoints and intervals appropriate to the application.

Do not run aggressive probes that overload the API.

Do not use a health-check request as a substitute for confirmation of a specific critical operation.

### Acceptance criteria

- The interface distinguishes offline status from API unavailability when sufficient evidence exists.
- Visual state updates after reconnection.
- Synchronization status is not confused with service availability.
- Responses do not expose internal details.
- A failed health query does not erase local data needed for recovery.

---

# 8. INDEXEDDB/DEXIE — LOCAL PERSISTENCE AND DATA ISOLATION

Implement or refactor local storage centrally.

If Dexie is already installed and used, maintain compatibility with the current structure. If it is not installed, evaluate its introduction based on concrete needs and existing dependencies.

Do not create multiple competing IndexedDB databases for storing the same information without an explicit justification.

## 8.1. Responsibilities

Local storage may be used for:

- Previously synchronized data required for offline operation.
- Precomputed clinical projections.
- Local catalogs that can be stored safely.
- Persistent state of the emergency Outbox.
- Synchronization metadata.
- Version control for the persisted format.
- Update and expiration timestamps.

Do not indiscriminately store all data received from the API.

Define which models genuinely require local persistence.

## 8.2. User isolation

Private records must have an unambiguous identity scope.

Local data queries must account for the user and, where applicable, the associated patient.

Do not assume that switching pages or removing a screen component is sufficient to isolate information between accounts.

After logout or identity switching:

- Clear private in-memory state.
- Invalidate queries and projections associated with the previous session.
- Prevent the new account from reading the previous account's clinical cache.
- Preserve only pending operations that need recovery and can be kept in an isolated state.
- Prevent an operation from being synchronized by an incompatible identity.

## 8.3. Security and retention

IndexedDB does not provide data-at-rest encryption by default.

Therefore:

- Minimize the amount of persisted clinical data.
- Avoid saving secrets and credentials.
- Define expiration for local data.
- Clear data that is no longer needed.
- Avoid storing complete medical records when a smaller projection is sufficient.
- Protect pending operations from cross-account access or submission.
- Do not log clinical information to the console.
- Document the actual limitations of local protection.

Do not claim that data is encrypted merely because it is stored in IndexedDB.

## 8.4. Transactions and database version

Define explicit versions for the IndexedDB schema.

Changes must handle old records, migrations, and pending operations compatible with previous versions.

Do not indiscriminately delete the local database when updating the application if that could discard pending emergencies.

When a schema change cannot preserve an old record, document the limitation and implement a safe recovery strategy.

## 8.5. Acceptance criteria

- Storage is centralized.
- Clinical data is not shared between users.
- The local schema is versioned.
- Pending operations survive restarts.
- Logout does not silently delete critical operations.
- Privacy and retention limits are documented.
- Migrations are tested.

---

# 9. CLINICAL SNAPSHOT — PRECOMPUTED PROJECTION AND CLINICAL CONSISTENCY

Implement a local clinical projection suitable for offline use, without turning that projection into an independent source of truth.

## 9.1. Objective

Allow previously synchronized clinical information to be retrieved efficiently under limited-connectivity conditions, especially in the emergency flow.

The projection must be composed from authorized local records, taking into account the data actually available.

## 9.2. Contents

The local snapshot may represent, according to the contract and actual need:

- Patient identification.
- Required demographic data.
- Active medications.
- Allergies.
- Chronic conditions.
- Emergency contacts.
- Relevant restrictions.
- Time of the last known synchronization.
- Schema version.
- Data provenance.
- Staleness indicators.

Do not invent properties absent from the backend.

Use existing models and fields as the reference.

## 9.3. Calculation strategy

The snapshot may be rebuilt when relevant information is updated.

Do not indiscriminately recalculate the entire medical record on every React render.

When joining medications and restrictions requires repeated lookups, use associative indexes with `Map` and canonical references.

Keep the following separate:

- Source data persisted locally.
- Derived indexes.
- Precomputed clinical projection.
- Historical snapshot confirmed by the server.

## 9.4. Invalidation

Invalidate or recalculate the projection when there is a confirmed change or relevant local change to:

- Profile.
- Medications.
- Allergies.
- Conditions.
- Contacts.
- Restrictions.

The policy must indicate when recalculation has completed and when synchronization is still pending.

Do not mark the projection as server-updated merely because local calculation has finished.

## 9.5. Acceptance criteria

- The projection can be rebuilt.
- The projection does not replace source records.
- Its version is compatible with the schema in use.
- Stale data is identified.
- Relevant changes invalidate derived data.
- Confirmed historical snapshots are not overwritten.
- Calculation is tested and its cost documented.

---

# 10. PWA, SERVICE WORKER, AND CACHE POLICIES

Implement or refactor the PWA using the existing solution. If the project uses `vite-plugin-pwa`, preserve that integration and confirm its options before changing the strategy.

## 10.1. Static resources

Static resources required to start the application must have an appropriate precache strategy.

The user must be able to open the basic interface when the browser has installed and retained the necessary resources, subject to actual browser and Service Worker update limitations.

Do not claim that all operations work offline merely because the application shell is cached.

## 10.2. General strategies

Use policies appropriate to each data type:

- **Static resources:** precache or a suitable strategy for versioned files.
- **Permitted reference catalogs:** Stale-While-Revalidate when compatible with the endpoint and privacy policy.
- **Cacheable dynamic data:** Network-First when permitted, with controlled fallback.
- **Private clinical data:** an explicit strategy that prevents leaks between users or sessions.

The recommended strategy does not authorize placing all private clinical responses in a single global Service Worker HTTP cache.

For private endpoints, use the application client and local storage with identity-based isolation when necessary. If a response cannot be stored safely in the Cache API, do not store it there merely to claim offline support.

Use of Dexie for previously synchronized clinical data must be compatible with the Service Worker strategy.

## 10.3. Private data and logout

A clinical response stored in the Cache API may remain available after logout or account switching if there is no specific policy to prevent this.

Before adding a cache strategy, evaluate:

- User identity.
- Request scope.
- Response headers.
- Privacy policy.
- Offline requirement.
- Expiration.
- Invalidation.
- Risk of cross-account exposure.
- Possibility of reuse by the Service Worker.

Do not use a generic cache to indiscriminately persist medical records.

## 10.4. Service Worker updates

Implement a predictable strategy for updating the application.

Avoid states in which:

- The application uses new types with an incompatible old Service Worker.
- New static resources are combined with old cached resources.
- An update destroys the emergency queue.
- The user remains indefinitely on an incompatible version.

Do not indiscriminately clear storage as part of an update.

## 10.5. Background synchronization

Background Sync may be used when supported and when its implementation respects browser contracts and limitations.

Do not rely exclusively on Background Sync to guarantee emergency submission.

The application must also reconcile pending operations when it is reopened and has safe authentication and connectivity conditions.

## 10.6. Acceptance criteria

- The PWA shell works according to the resources actually stored.
- Catalog queries respect the cache policy.
- Private data is not shared between accounts.
- The Service Worker does not delete critical operations without a recovery strategy.
- Application updates are compatible with the local schema.
- The interface distinguishes offline availability from server confirmation.

---

# 11. SECURITY, PRIVACY, AND PROTECTION OF CLINICAL INFORMATION

Security must span all modules.

## 11.1. Authorization

The frontend must show only actions and information appropriate to the session context, but it cannot replace backend authorization controls.

Do not use localStorage, IndexedDB, URLs, query strings, or React state to determine definitive permissions.

Do not consider a known identifier proof of authorization.

## 11.2. Personal and clinical data

Minimize private data stored in memory, IndexedDB, the Cache API, and logs.

Do not log:

- Passwords.
- Tokens.
- Refresh tokens.
- Credentials.
- Complete clinical snapshots.
- Entire medical records.
- Personal identifiers without a need.
- Complete emergency payloads in debug logs.

Avoid including sensitive data in URLs.

## 11.3. Sessions and identity switching

Account switching must invalidate the relevant visual state and cache.

Do not use data from the previous session to compose an emergency for the new user.

Do not allow a pending operation to be synchronized by another account merely because it is available in the same browser.

## 11.4. Cookie-based authentication

When the API uses `HttpOnly` cookies, preserve the configured credential model.

Do not attempt to access protected cookies through JavaScript.

When necessary, integrate the CSRF token or mechanism specified by the contract without inventing a parallel solution that conflicts with the backend.

## 11.5. Browser errors and logs

Remove development logs that expose clinical information.

Do not display raw infrastructure errors.

Centralize failure handling and produce messages suitable for users.

## 11.6. Acceptance criteria

- Session switching does not expose data from the previous account.
- No credentials are persisted in IndexedDB.
- Logs and messages do not expose complete clinical data.
- The frontend respects authorization contracts.
- The cache is not treated as a source of permission.
- The offline queue cannot be submitted by an incompatible identity.

---

# 12. MANDATORY PRESERVATION OF VISUAL IDENTITY AND NAVIGATION

The refactoring must be architectural and functional, not an aesthetic redesign.

**Do not change the existing design.**

Preserve:

- Colors.
- Typography.
- Logo.
- Spacing.
- Layouts.
- Visual components.
- Icons.
- Form patterns.
- Cards.
- Tables.
- Sidebars.
- Headers.
- Footers.
- Visual feedback.
- Responsiveness.
- Appearance of login, registration, profile, and monitoring pages.

Do not replace functional visual components with improvised versions to make refactoring easier.

Do not remove a UI component because another is architecturally more convenient.

If the internal structure of a component needs to change, preserve its visual contract and interaction states.

## 12.1. Mandatory clinical routes

Preserve existing paths, including:

- `/medicamentos`
- `/alergias`
- `/doencas-cronicas`

Chronic conditions and allergies must not be converted to `/minha-saude/doencas-cronicas` or `/minha-saude/alergias`.

The `/alergias` and `/doencas-cronicas` routes must remain independent of the `/minha-saude` prefix, as must `/medicamentos`.

## 12.2. Sidebar and profile

Preserve existing clinical features in the sidebar.

Keep **Chronic Conditions** and **Allergies** as separate options, outside the “My Health” group, using their corresponding paths.

Do not remove functional health items merely to simplify navigation.

Removal of secondary items such as Settings, Notifications, and Help should be retained only when consistent with the existing functional decision for the project.

Keep the logout behavior on the `/perfil` page, including its position after the “Danger Zone” section, if that is the current organization in the reference code.

Do not remove logout, hide its option, or move it elsewhere without an explicit need.

## 12.3. Monitoring routes

Preserve existing login, registration, and clinical-query routes, including:

- `/monitoramento`
- `/monitoramento/login`
- `/monitoramento/cadastro/`
- `/monitoramento/pacientes`

Confirm the router's current behavior before changing redirects.

When no initial staff account is configured and the application uses the registration screen as an initialization step, navigation must remain consistent with the `/monitoramento/cadastro/` flow.

This behavior does not authorize unrestricted public registration of privileged users. The screen must respect the provisioning mechanism established in the backend.

Keep the login path accessible when applicable. Do not remove the authentication link while fixing the registration flow.

If an initial-configuration error occurs, display a state and action compatible with the backend, without leaving the interface stuck on a screen with no navigation.

## 12.4. Visual compatibility

Before changing shared components, examine the original screens and their states.

The `apps/web-staff` screens must maintain the visual identity previously used by the operational application, even if they share utilities with `apps/web`.

Do not introduce font changes or external remote resources without a demonstrated technical need.

## 12.5. Acceptance criteria

- Routes preserve their paths.
- Visual identity remains equivalent to the reference version.
- Navigation links continue to work.
- Logout remains accessible.
- Staff pages do not lose their visual identity.
- Error states do not leave users without navigation.
- Refactoring does not remove existing clinical features.

---

# 13. PERFORMANCE, EFFICIENCY, AND CONSISTENCY

## 13.1. HTTP requests

Avoid:

- Duplicate queries.
- Requests triggered on every render.
- Refetch loops.
- Unnecessary simultaneous requests.
- Searching large lists without debounce.
- Failure to cancel outdated searches.
- Unnecessary updates to large clinical projections.

Use TanStack Query and hook features with appropriate dependency control.

## 13.2. Associative indexes

When joining medication and restriction lists is necessary, use structures such as `Map` with canonical keys.

Do not repeatedly perform linear searches through extensive arrays in nested loops when an index can solve the problem.

Consider total operation complexity, index-construction cost, record volume, and update frequency.

Do not claim an optimization is proven merely because it uses `Map`, caching, or memoization.

## 13.3. Rendering

Avoid introducing excessive re-renders during refactoring.

Use `useMemo`, `useCallback`, and component memoization only when justified by React semantics and actual cost.

Do not use indiscriminate memoization as a substitute for appropriate architecture.

## 13.4. Lists and pagination

Consume the pagination defined by the API.

Do not load every record in a table merely to simplify interface implementation.

Preserve existing sorting criteria and filters.

When the API uses keyset pagination, respect its cursors and contract semantics.

## 13.5. Consistency between remote cache and IndexedDB

TanStack Query and IndexedDB have distinct purposes.

The former manages remote state and its in-memory updates.

The latter stores persistent local data for authorized use cases.

Do not create two independent, unreconciled states representing the same resource.

Clearly define the source of each piece of data, the update mechanism, and behavior in the event of divergence.

---

# 14. TESTING AND QUALITY STRATEGY

Create or fix useful tests in both applications.

Use existing frameworks. Add dependencies only when necessary and compatible with the workspace.

## 14.1. Unit tests

Cover:

- Use cases.
- Mappers.
- Presentation rules.
- Input validation.
- Error classification.
- Synchronization states.
- Idempotency-key management.
- Snapshot calculation.
- `Map` indexes.
- Invalidation logic.
- Identity isolation.

## 14.2. Integration tests

Cover:

- HTTP client and error handling.
- Request and response contracts.
- TanStack Query hooks.
- Mutations and invalidation.
- IndexedDB/Dexie.
- Outbox persistence.
- Operation synchronization.
- Timeout handling.
- Reconciliation after failure.
- Catalog cache.
- Authentication and session switching.

## 14.3. E2E tests

When the environment permits, validate complete flows such as:

- Patient login.
- Patient registration.
- Password recovery according to the existing contract.
- Profile retrieval and update.
- Medication addition and editing.
- Allergy and condition queries.
- Contact updates.
- Behavior when clinical restrictions apply.
- Online emergency triggering.
- Emergency created while offline.
- Queue persistence after reloading the page.
- Synchronization after network recovery.
- Retry after timeout without duplication.
- Staff login and logout.
- Operational-feed retrieval.
- Acceptance or state change when permitted.
- Opening the authorized clinical profile.
- Recovery after WebSocket failure.
- Navigation and redirects for existing routes.

## 14.4. Security and isolation tests

Explicitly verify:

- User switching while data exists in IndexedDB.
- Logout while private queries remain cached.
- Attempt to use an offline operation under another identity.
- Attempt to view another patient's data.
- Access to a protected route without a session.
- Session expiration during an operation.
- Outdated local payload.
- Repeated emergency requests.
- Duplicate events received through WebSocket.

The frontend cannot replace backend authorization tests. However, its own cache, navigation, and operation-association mechanisms must be tested to prevent accidental leaks.

## 14.5. Truthfulness criterion

Do not claim tests passed without running them.

Do not mark tests as passed merely because the files were created.

Do not use mocks to claim that a production integration has been validated.

Keep unit-test, integration-test, and E2E results separate.

---

# 15. BACKEND COMPATIBILITY AND CONTRACT EVOLUTION

Frontend refactoring must be coordinated with the backend architectural reconstruction prompt.

## 15.1. Backend rules are authoritative

The following responsibilities remain in the backend:

- Definitive authentication.
- Role- and resource-based authorization.
- Staff provisioning.
- Clinical-data persistence.
- Blocking medication validations.
- Emergency state and transitions.
- Persistent idempotency.
- Persistence and preservation of historical snapshots.
- Professional selection and assignment.
- Location and availability control.
- Event publication after persistence.
- Server Outbox.
- Operational health checks.
- Redis cache and invalidation.

Do not implement a competing version of these rules in the browser.

## 15.2. Idempotency and confirmation

The client must respect `X-Idempotency-Key` on the trigger endpoint when that is the defined contract.

Do not use Redis from the frontend.

Do not attempt to replace backend persistent idempotency with an identifier generated only in memory.

## 15.3. Catalogs

The frontend must use the catalog APIs.

The JSON → seed → PostgreSQL process is the responsibility of the project's data infrastructure.

Redis accelerates backend access but does not make the catalog directly accessible to the browser.

## 15.4. Socket.IO

Integrate Socket.IO Client with the Gateway's actual contracts.

Do not transmit complete snapshots through events when the backend provides them through protected REST endpoints.

Real-time events must trigger consistent interface updates, not create a second source of truth.

## 15.5. Health

Use the health endpoints actually available and their specific semantics.

Do not consider a successful health check as confirmation that a business mutation has completed.

## 15.6. Missing endpoint or required field

If the contract does not provide a required field:

1. Confirm its absence in the backend.
2. Identify the component that depends on it.
3. Do not simulate its value.
4. Do not attempt to obtain the information from another endpoint without authorization.
5. Record the required contract change.
6. Continue other activities independent of the pending item.

---

# 16. MANDATORY EXECUTION PHASES

Perform the work in an ordered and incremental manner.

## Phase 1 — Audit and stabilization

- Inventory both frontends.
- Identify dependencies, scripts, and configurations.
- Map all routes.
- Map HTTP contracts.
- Check API integration.
- Identify build and typecheck errors.
- Fix invalid or incompatible tests.
- Audit local storage.
- Check the Service Worker and cache policies.
- Identify potential cross-session leaks.
- Establish reproducible validation commands.

Do not change the application's design during this phase.

## Phase 2 — Architectural core

- Establish internal contracts.
- Organize the layers.
- Consolidate the HTTP client.
- Standardize errors.
- Organize query hooks and mutations.
- Separate domain models and DTOs.
- Create IndexedDB adapters where necessary.
- Avoid dependency cycles.
- Introduce automated architectural checks when compatible with the project.

## Phase 3 — AUTH and session

- Fix login and logout.
- Preserve patient registration.
- Fix password recovery and OAuth where present.
- Respect the backend's session model.
- Review guards and navigation.
- Implement cache isolation by identity.
- Fix the visual staff-provisioning flow according to the backend.

## Phase 4 — PATIENTS and clinical modules

- Refactor patients.
- Refactor medications.
- Refactor the medication catalog.
- Refactor allergies.
- Refactor conditions.
- Refactor the disease dictionary.
- Refactor contacts.
- Refactor medication restrictions.
- Fix form and list integrations.
- Preserve `frequency`.
- Preserve existing routes, fields, and relationships.
- Implement cache reconciliation.

## Phase 5 — IndexedDB, snapshot, and PWA

- Audit the local schema.
- Centralize the Dexie adapter.
- Implement or fix versioning.
- Isolate private records.
- Build the local clinical projection.
- Define invalidation and expiration.
- Fix Service Worker policies.
- Implement secure user-switch handling.
- Validate preservation of the critical queue.

## Phase 6 — EMERGENCY and local Outbox

- Fix integration with `POST /api/v1/emergency/trigger`.
- Implement a stable idempotency key.
- Ensure local persistence of operations.
- Implement clear local states.
- Fix retry and backoff.
- Implement reconciliation after timeouts.
- Distinguish offline operations from confirmed operations.
- Fix geolocation acquisition.
- Test browser restarts.
- Validate integrity of the local and historical snapshot.

## Phase 7 — STAFF and real-time communication

- Fix the existing HTTP feed.
- Fix patient-data mapping.
- Preserve authorized clinical access.
- Preserve map behavior.
- Implement `tel:` links for authorized contacts.
- Integrate Socket.IO when backend contracts are available.
- Preserve HTTP fallback.
- Implement query invalidation after events.
- Validate presentation of states and concurrency.

## Phase 8 — HEALTH, errors, and degraded states

- Integrate the actual health endpoints.
- Distinguish offline status from API unavailability.
- Standardize messages.
- Handle 401, 403, 409, 422, 429, and server errors according to the contract.
- Fix improper redirects.
- Validate reconnection.
- Avoid unnecessary probes.

## Phase 9 — Testing and final verification

- Run lint.
- Run typecheck.
- Run unit tests.
- Run integration tests.
- Run E2E tests when the environment permits.
- Build `apps/web`.
- Build `apps/web-staff`.
- Validate PWA flows.
- Validate local storage.
- Validate pending-operation behavior.
- Confirm contract compatibility.
- Validate applicable Docker environments.
- Fix discovered regressions.
- Update technical documentation.
- Record actual limitations.

If resources are limited, prioritize clinical-data integrity, authentication, user isolation, and the emergency flow. Complete as much work as possible without claiming something is complete when it has not been implemented or tested.

---

# 17. GLOBAL ACCEPTANCE CRITERIA

The work may be considered complete only when there is evidence for the applicable items.

## Architecture

- The 12 functional modules are organized coherently.
- The domain does not depend on React.
- Use cases depend on contracts.
- HTTP integrations are centralized.
- No unnecessary architectural cycles have been introduced.
- Created abstractions have clear responsibilities.
- Both applications preserve their functional identities.

## Backend integration

- Used endpoints exist and match actual contracts.
- DTOs and mappers are consistent.
- No payloads are changed silently.
- Displayed states reflect actual responses.
- Definitive validation remains in the backend.
- No feature depends on direct access to Prisma, PostgreSQL, or Redis.

## Auth and privacy

- The frontend does not assign privileges to the user.
- Login, logout, and expiration flows work.
- Cache is isolated by identity.
- Reusable tokens are not stored in IndexedDB.
- Errors do not expose sensitive data.
- Account switching does not expose clinical information from the previous session.

## Catalogs

- Medications and diseases are consumed through the API.
- Existing JSON files remain reference sources for the backend loading process.
- No second catalog data source has been created in the browser.
- Local cache follows the defined policy.
- Updates and invalidation have been verified.

## Medications and restrictions

- `frequency` is preserved.
- `schedules` has not been reintroduced.
- Local pre-validation does not replace backend blocking.
- Blocking restrictions are not displayed as completed operations.
- Local indexes use canonical keys and have defined invalidation criteria.

## PWA and IndexedDB

- Local storage is centralized.
- Persisted models are versioned.
- The cache policy does not leak data between sessions.
- Pending operations survive restarts.
- Logout does not silently discard critical operations.
- The Service Worker is not treated as a guarantee of server persistence.
- Local-storage security limitations are documented.

## Emergencies

- The flow uses the real emergency endpoint.
- The idempotency key remains stable across repeated attempts.
- The local Outbox is persistent.
- Local state is separate from official server states.
- The application distinguishes offline operations from confirmed operations.
- The local snapshot has a version and provenance.
- The historical snapshot is not silently overwritten.
- Location is not invented when unavailable.
- The recovery cycle has been tested.

## Staff

- The HTTP feed remains functional.
- Real-time communication uses only existing contracts.
- Socket.IO unavailability does not render the feed unusable.
- Sensitive data is not transmitted indiscriminately.
- Patient identification matches the correct incident.
- CPF and other identifiers are displayed only when provided and authorized.
- The accessed medical record belongs to the selected patient.
- The historical snapshot is distinguished from the current medical record.

## Visual identity and navigation

- The original visual identity is preserved.
- Existing routes continue to work.
- `/medicamentos`, `/alergias`, and `/doencas-cronicas` are preserved.
- Clinical items in the sidebar remain accessible.
- Logout remains available.
- Operational screens preserve their visual pattern.
- No unrequested aesthetic changes have been introduced.

## Quality

- Lint executed.
- Typecheck executed.
- Builds for both frontends executed.
- Relevant tests executed.
- Results documented.
- Discovered regressions addressed.
- No test is reported as passed without execution.
- External or backend-dependent pending items are clearly identified.

---

# 18. MANDATORY FORMAT FOR THE IMPLEMENTATION AGENT'S FINAL RESPONSE

Upon completion, present a technical report containing:

1. **Executive summary:** what was actually changed in each frontend.
2. **Initial diagnosis:** issues identified in the existing code.
3. **Final architecture:** layers, modules, contracts, and dependency direction.
4. **12-module matrix:** completion status, relevant files, and pending items.
5. **Backend compatibility:** endpoints, DTOs, errors, and preserved contracts.
6. **Authentication and security:** actual changes to sessions, visual authorization, and data isolation.
7. **IndexedDB/Dexie:** structure, versioning, retention policies, and isolation.
8. **PWA:** cache strategies, Service Worker, and offline behavior.
9. **Clinical Snapshot:** structure, calculation, provenance, invalidation, and limitations.
10. **Local Outbox:** idempotency, retry, persistence, recovery, and reconciliation.
11. **Emergency:** changes made to the complete client-side flow.
12. **Staff:** feed, patient identification, clinical view, and Socket.IO, when integrated.
13. **Routes and interface:** confirmation of visual and functional preservation.
14. **Tests:** commands actually executed and real results.
15. **Build:** results for `apps/web` and `apps/web-staff`.
16. **Docker and deployment:** checks performed, where applicable.
17. **Main files changed:** objective list with rationale.
18. **Pending items:** only what was not completed, with the concrete reason and required action.
19. **Execution instructions:** reproducible commands to install, validate, and run the frontends.
    Do not present a list of planned tasks as if the changes had been performed.

Do not claim that all tests passed without running the corresponding suite.

Do not classify the frontends as production-ready merely because the builds completed.