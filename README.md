# BrainSAIT Academy

This repository now contains a minimal, production-ready scaffold for the BrainSAIT IHI course migration pipeline in `brainsait-ihi-pipeline/`.

## Included scaffold

- `brainsait-ihi-pipeline/package.json` with Node 18+ scripts
- `brainsait-ihi-pipeline/.env.local.example` for required credentials
- `brainsait-ihi-pipeline/courses/sample-course.md` for smoke testing
- `brainsait-ihi-pipeline/pipeline.ts` for markdown-to-JSON conversion
- `brainsait-ihi-pipeline/import-notion.ts` for Notion payload generation/import
- `brainsait-ihi-pipeline/import-d1.ts` for Cloudflare D1 SQL generation/import
- `brainsait-ihi-pipeline/scripts/generate-html.js` for HTML preview generation
- `.github/workflows/deploy.yml` for build, smoke-test, artifact upload, and optional Cloudflare deployment

## Local setup

1. Install Node.js 18 or newer.
2. Copy `brainsait-ihi-pipeline/.env.local.example` to `brainsait-ihi-pipeline/.env.local`.
3. Fill in the required credentials:
   - `ANTHROPIC_API_KEY`
   - `NOTION_API_TOKEN`
   - `NOTION_DATABASE_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` (`d7b99530559ab4f2545e9bdc72a7ab9b`)
   - `CLOUDFLARE_D1_DATABASE_ID` (`b56a9a2d-3992-4ddc-80b8-e95c2a0de2b3`)
   - `CLOUDFLARE_PAGES_PROJECT_NAME`
4. Run:

   ```bash
   cd brainsait-ihi-pipeline
   npm install
   npm test
   ```

## Notion database properties

Create the destination Notion database with:

- `Title` (title)
- `Title (Arabic)` (rich text)
- `Slug` (rich text, unique)
- `Source URL` (url)
- `Status` (select: `Published`, `Draft`)
- `Duration` (number)
- `Keywords` (multi-select)

## D1 schema and API notes

`import-d1.ts` creates or updates a `courses` table with:

- `slug`
- `title`
- `title_arabic`
- `source_url`
- `status`
- `duration`
- `keywords`
- `summary`
- `sections_json`

Use `node dist/import-d1.js --execute` after building to send the generated SQL to the Cloudflare D1 Query API.

## Deployment workflow

The GitHub Actions workflow:

1. Installs dependencies in `brainsait-ihi-pipeline`
2. Builds the TypeScript scripts
3. Runs a smoke test against `courses/sample-course.md`
4. Uploads the generated HTML preview as an artifact
5. Optionally deploys `dist/site` to Cloudflare Pages when these repository secrets are configured:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PAGES_PROJECT_NAME`

## Recommended production checklist

- Validate one sample course locally with `npm test`
- Review the generated `dist/sample-course.json`
- Review the Notion preview payload at `dist/notion-import-preview.json`
- Review the D1 SQL preview at `dist/d1-import-preview.sql`
- Configure repository secrets before enabling workflow-based deployments
- Store real credentials in a password manager or vault instead of version control
