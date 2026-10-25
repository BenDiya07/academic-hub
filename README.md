# Academic Hub

Academic Hub is an Angular application for academic collaboration, with projects,
communities, discussions, direct messages, and user profiles. The workspace uses
Nx and Supabase.

## Requirements

- Node.js supported by Angular 21
- npm
- A Supabase project with the schema in `supabase/migrations`

Install dependencies and start the development server:

```sh
npm install
npx nx serve academic-hub
```

The app is available at `http://localhost:4200`.

## Supabase configuration

Set the project URL and **publishable/anon key** in both:

- `apps/academic-hub/src/environments/environment.ts` (development)
- `apps/academic-hub/src/environments/environment.prod.ts` (production)

These values are bundled into the browser application. Only use a Supabase
publishable/anon key here; never put a service-role key or other secret in
client-side configuration. Supabase row-level security policies are required
because browser requests use the publishable/anon key.

Apply the SQL migrations in `supabase/migrations` to the configured Supabase
project. Configure the Supabase Auth providers, redirect URLs, and email
confirmation settings in the Supabase dashboard to match the app's deployed
origin. OAuth and password reset redirects use `/auth/callback`.

## Build and checks

Create an optimized production build:

```sh
npx nx build academic-hub --configuration=production
```

Run the app's lint and unit tests:

```sh
npx nx lint academic-hub
npx nx test academic-hub
```

The production bundle is written to `dist/apps/academic-hub`.
