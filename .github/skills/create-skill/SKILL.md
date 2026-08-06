---
name: create-skill
description: 'Guide creation of a reusable Copilot skill (SKILL.md) for this repository, including structure, metadata, and authoring checklist.'
argument-hint: 'What workflow or repeatable process should this new skill support?'
user-invocable: true
disable-model-invocation: false
---

# Create Skill

## When to Use
- When you want to define a reusable, project-scoped Copilot skill.
- When you need to capture a repeatable workflow, checklist, or automation in a `SKILL.md` file.
- When you want to make agent actions discoverable via `/create-skill`.

## What This Skill Produces
- A well-structured `SKILL.md` in `.github/skills/<skill-name>/`
- A skill definition with metadata, description, and procedural steps
- A reusable authoring checklist to ensure clarity and discoverability

## Procedure
1. Choose a clear skill name:
   - Lowercase alphanumeric with hyphens
   - Matches the folder name under `.github/skills/`
   - Example: `release-checklist`, `frontend-testing`, `docs-review`
2. Create the folder for the skill:
   - `.github/skills/<skill-name>/`
3. Add `SKILL.md` with required YAML frontmatter:
   - `name`
   - `description`
   - Optional: `argument-hint`, `user-invocable`, `disable-model-invocation`
4. Write the body with these sections:
   - What the skill does
   - When to use it
   - Step-by-step procedure
   - Completion criteria or expected output
5. Keep the file concise and discoverable:
   - Use keyword-rich descriptions
   - Keep the main guidance under 500 lines
   - Reference additional docs or scripts only when needed
6. Save and validate:
   - Ensure the `name` field exactly matches the folder name
   - Confirm the skill folder and `SKILL.md` are committed to the repo

## Authoring Checklist
- [ ] Skill folder created under `.github/skills/`
- [ ] `SKILL.md` frontmatter includes required fields
- [ ] Description clearly explains the purpose and use case
- [ ] Procedure is a step-by-step workflow
- [ ] File is self-contained or references local assets with `./`
- [ ] Skill name matches folder name

## Example Prompts
- `Create a SKILL.md for a release checklist workflow.`
- `Define a skill to validate changelog and package version before publish.`
- `Help me write a repo-level skill for code review preparation.`

## Related Customizations
- Add `references/` docs for larger guidance if the workflow needs extra detail
- Add `scripts/` for executable validation or automation
- Use `.agents/skills/<name>/` or `~/.copilot/skills/<name>/` for personal skills instead of repo-scoped skills
