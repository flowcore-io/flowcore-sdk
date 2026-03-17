---
name: update-sdk-docs
description: Create or update Flowcore SDK documentation fragments in Usable for a given domain. Reads SDK source, extracts command signatures, and syncs with the documentation series.
allowed-tools: Read, Glob, Grep, mcp__usable__agentic-search-fragments, mcp__usable__get-memory-fragment-content, mcp__usable__create-memory-fragment, mcp__usable__update-memory-fragment, mcp__usable__search-memory-fragments
---

# Update SDK Documentation

You are documenting the `@flowcore/sdk` package. Given a domain name (e.g., `data-pathways`, `tenants`, `iam`), you
will:

1. **Read SDK source** for the domain
2. **Extract command signatures** (class name, input/output types, auth method, HTTP method, URL pattern)
3. **Search Usable** for existing documentation fragments
4. **Create or update** Template fragments following the series pattern

## Arguments

- `$0` — Domain name (directory under `src/commands/`, e.g. `data-pathways`, `ai-agent-coordinator`)
- `$1` — (optional) `--validate-only` to just check existing docs without modifying

## Workspace & Type IDs

- WorkspaceId: `60c10ca2-4115-4c1a-b6d7-04ac39fd3938`
- Template type: `da2cd7c6-68f6-4071-8e2e-d2a0a2773fa9`
- Collection: `963502d1-8a5a-4895-9bb6-18b8a75de36f` (Flowcore SDK Documentation)
- Overview fragment: `20986dd4-4a53-4fb9-9217-46cfbf535307`

## Steps

### 1. Read source files

```
Glob: src/commands/$0/**/*.ts
```

Read each file and extract:

- Class name (e.g., `DataPathwayCreateCommand`)
- Input interface with all fields and types
- Output type
- Auth method (`bearer` or `apiKey`)
- HTTP method and URL pattern

Also check `src/contracts/$0.ts` for TypeBox schemas if it exists.

### 2. Search existing docs

Use `mcp__usable__agentic-search-fragments` with:

- Query: `Flowcore SDK $0 documentation`
- Tags: `repo:flowcore-sdk`
- WorkspaceId: `60c10ca2-4115-4c1a-b6d7-04ac39fd3938`

### 3. If `--validate-only`

Compare source commands against documented commands. Report:

- Commands in source but not documented
- Commands documented but not in source (stale)
- Input/output type mismatches
- Auth method mismatches

### 4. Create or update fragments

Follow the series pattern from existing fragments:

#### Fragment structure

```markdown
Series:

- [Overview](https://alminni.com/dashboard/workspaces/60c10ca2-4115-4c1a-b6d7-04ac39fd3938/fragments/20986dd4-4a53-4fb9-9217-46cfbf535307)
- [Setup & Authentication](...)
- ... (full series index with all entries)

### Purpose

Brief description of what this domain covers.

### Authentication

Which commands use bearer vs apiKey.

### Quick snippets

3-4 most common operations with full import + usage.

### Command reference — {SubDomain}

For each command:

- Name — ClassName (auth, METHOD `/path`) \`\`\`ts export interface InputType { // all fields with types } // Output:
  OutputType { fields } await client.execute(new ClassName({ ... })) \`\`\`

### Notes

Domain-specific gotchas, conventions, tips.

### See also

Related fragments.

Previous: [link] Next: [link]
```

#### Fragment metadata

- Type: Template (`da2cd7c6-68f6-4071-8e2e-d2a0a2773fa9`)
- Tags: `repo:flowcore-sdk`, `{domain}`, `{sub-domains}`, `templates`, `documentation`
- Collection: `963502d1-8a5a-4895-9bb6-18b8a75de36f`

### 5. Update the Overview fragment

Add the new domain to:

- Coverage bullet in "Key capabilities"
- "Choosing the right area" section
- "Where next" list

### 6. Update series index in all fragments

Add new fragment links to the series index block in every existing fragment in the collection.
