# Flowcore SDK Documentation Process

## Where SDK docs live

All `@flowcore/sdk` documentation is stored as **Usable memory fragments** in the **Flowcore workspace**.

- **Workspace ID**: `60c10ca2-4115-4c1a-b6d7-04ac39fd3938`
- **Collection**: "Flowcore SDK Documentation" (`963502d1-8a5a-4895-9bb6-18b8a75de36f`)
- **Fragment type**: Template (`da2cd7c6-68f6-4071-8e2e-d2a0a2773fa9`)

## Series structure

The documentation is a 14-part linked series:

| #  | Title                                                            | ID                                     |
| -- | ---------------------------------------------------------------- | -------------------------------------- |
| 1  | Overview                                                         | `20986dd4-4a53-4fb9-9217-46cfbf535307` |
| 2  | Setup & Auth                                                     | `fc26ae19-a5c8-4279-b0d5-657fc96b0fd2` |
| 3  | Command Model                                                    | `1cf11029-bdca-4704-930c-32ffbb198f45` |
| 4  | Tenants & Data Cores                                             | `b68259e4-a71b-4097-871b-6da3a3cfa2b6` |
| 5  | Flow & Event Types                                               | `09aff180-5b1a-4f53-b0e9-8539b50f8ceb` |
| 6  | Ingestion                                                        | `1e9892c1-e24a-4066-b498-b2fadef29199` |
| 7  | Events/Time Buckets                                              | `2aa001e6-e798-42b4-beff-7dca4b2d90ac` |
| 8  | AI Agent Coordinator                                             | `629093ae-6093-4715-954c-9d2db8662aa8` |
| 9  | IAM                                                              | `2594d70e-21f1-4de2-909c-e252a0a49082` |
| 10 | API Keys/Vars/Secrets                                            | `37005ab0-bc58-4194-84ae-d205e11b0171` |
| 11 | Error Handling                                                   | `70eb091a-7173-40d2-b696-1b77fb03d22a` |
| 12 | Environment & Builds                                             | `245adbe1-3acc-41c9-a053-41f01be86372` |
| 13 | Data Pathways (Pathways, Slots, Assignments)                     | `289b15ec-f55d-4efa-ad5f-0f7b436c0046` |
| 14 | Data Pathways (Commands, Restarts, Capacity, Quotas, Pump State) | `2c801cb8-7373-43d4-a2e0-7e53632ae1c0` |

Each fragment contains:

- A **series index** at the top linking to all other fragments
- **Previous/Next** navigation links at the bottom
- The current fragment marked with "(you are here)"

## How to document SDK changes

### Using the slash command

```
/update-sdk-docs <domain>
```

Where `<domain>` is the directory name under `src/commands/` (e.g., `data-pathways`, `ai-agent-coordinator`, `iam`).

Options:

- `/update-sdk-docs data-pathways` — Create or update docs for the data-pathways domain
- `/update-sdk-docs data-pathways --validate-only` — Check existing docs against source without modifying

### What the command does

1. Reads all `*.ts` files in `src/commands/<domain>/`
2. Extracts command class names, input/output types, auth methods, HTTP methods, and URL patterns
3. Searches Usable for existing documentation fragments for that domain
4. Creates new or updates existing Template fragments following the series pattern
5. Updates the Overview fragment to include the new domain

## Fragment format conventions

### Series index

Every fragment starts with a linked series index. When adding new entries, add them at the end (before the closing of
the series block) and update ALL existing fragments to include the new entries.

### Content sections

1. **Purpose** — One-line description of what the domain covers
2. **Authentication** — Which commands use `bearer` vs `apiKey`
3. **Quick snippets** — 3-4 most common operations with full import statements
4. **Command reference** — Grouped by sub-domain. For each command:
   - Name, class, auth method, HTTP method, URL pattern
   - Full input interface with types
   - Output type with key fields
   - Usage example
5. **Notes** — Domain-specific gotchas, conventions
6. **See also** — Related fragments
7. **Previous/Next** — Navigation links

### Tags

All fragments should have:

- `repo:flowcore-sdk` — Repository tag
- Domain-specific tags (e.g., `data-pathways`, `pathways`, `slots`)
- `templates` — Fragment category
- `documentation` — Content type

### Splitting large domains

If a domain has more than ~15 commands, split into multiple fragments. For example, `data-pathways` (27 commands) is
split into:

- Part 1: Pathways, Slots, Assignments (15 commands)
- Part 2: Commands, Restarts, Capacity, Quotas, Pump State (12 commands)

## When to update docs

- After adding new commands to the SDK
- After changing command input/output types
- After changing auth requirements
- After adding new domains
- Run `--validate-only` periodically to check for drift
