# Live data setup with Supabase

This project does not need Bolt Cloud. It uses a Supabase Edge Function to call the public ASF NISAR catalog and NASA FIRMS API. The Supabase project provides the function runtime and secret storage; the app does not currently read or write database tables.

Netlify deployment is configured in `netlify.toml` to run `npm run build` and publish the fresh `dist` output. `public/_redirects` sends app routes such as `/sources` to the SPA entry point. Push the updated project to the branch connected to Netlify and redeploy so the production site uses the current build.

## 1. Create or select a Supabase project

Open the Supabase Dashboard and create a project, or select the project you already have. Copy its **Project URL** and **Publishable key** from **Project Settings → API Keys**. Publishable keys are intended for browser clients. The app also accepts the legacy anon key. Never use the `service_role` or `sb_secret_...` key in the website.

## 2. Configure the local app

In the project root, create `.env.local` with these two values:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Replace the example values. The project accepts either `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`. Keep `.env.local` private; it is ignored by Git. Restart `npm run dev` after editing it.

For a deployed frontend, add the same two variables in that host's build/deployment environment and trigger a new build. Vite embeds `VITE_` values in the browser bundle, so only put the public project URL and publishable/anon key there—never a secret key or FIRMS key.

## 3. Link this folder to your Supabase project and deploy the function

Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started), then open PowerShell in this project folder and run:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy live-earth-data
```

Get `YOUR_PROJECT_REF` from the project URL: it is the subdomain before `.supabase.co`. Keep `supabase/config.toml`'s `verify_jwt = true`. After deployment, **Edge Functions** in the Supabase Dashboard should list `live-earth-data`.

## 4. Add the NASA FIRMS key to Supabase

Request a free [NASA FIRMS MAP_KEY](https://firms.modaps.eosdis.nasa.gov/api/map_key/). In Supabase, open **Project Settings → Edge Functions → Secrets** (or **Edge Functions → Secrets**, depending on the dashboard layout), add:

- Name: `FIRMS_MAP_KEY`
- Value: your NASA-issued MAP_KEY

Save it. Do not put this value in `.env.local`, `VITE_` variables, frontend code, or Git. The Edge Function reads it on the server. You do not need to redeploy after adding a secret.

## 5. Check the live feed

Start or reload the frontend, open **Fire story → Live · latest feeds**, then select **Refresh feeds**. ASF catalog search and browse previews are public and do not need a key. FIRMS needs `FIRMS_MAP_KEY`. In the Supabase Dashboard, inspect **Edge Functions → live-earth-data → Logs** if the request fails.

## 6. Enable the Gemini research assistant

The **Drivers** and **Applications** pages include an opt-in Gemini assistant. It uses Google Search grounding to answer a submitted question and return source links. It sends the question and fixed project notes to Gemini; it does not upload or analyze the NISAR browse images. The assistant supports research and interpretation, not change detection.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey). Review the current Gemini API pricing and set any available usage limits for your project.
2. In the Supabase Dashboard, open **Project Settings → Edge Functions → Secrets** (or **Edge Functions → Secrets**) and add `GEMINI_API_KEY` with the key value. Keep it out of `.env.local`, every `VITE_` variable, frontend code, and Git.
3. Deploy the function from this project folder:

   ```powershell
   supabase functions deploy evidence-assistant
   ```

   `supabase/config.toml` keeps JWT verification enabled. The browser sends only the public Supabase key; Gemini credentials stay in the Edge Function secret store.
4. Open **Drivers** or **Applications**, choose a suggested question or enter your own, and submit it. The assistant checks current sources and displays citations with its response. Requests may consume Gemini API quota and Google Search grounding can incur charges.

Until the secret is set and the function is deployed, the page displays a setup error. Do not paste API keys into the website's question box or into chat.

## What this integration returns

- The latest five days of NOAA-21 VIIRS FIRMS detections, filtered to the project footprint.
- ASF NISAR GCOV metadata and browse quicklooks when available.
- Quicklooks are previews, not calibrated map layers or measurements. The function does not download full GCOV science products, and FIRMS detections do not measure burned area or establish that fire caused a radar contrast.
- Live requests are cached for ten minutes. Archive mode continues to use the supplied, fixed project snapshot.

## Common errors

- **“Supabase is not configured…”**: check `VITE_SUPABASE_URL` and one of `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`, then restart/rebuild the frontend.
- **401 / Invalid JWT**: confirm the publishable key is copied exactly and the deployed function uses this repository's `supabase/config.toml`. Supabase's gateway accepts publishable keys for compatibility with `verify_jwt`; if the project's gateway rejects it, use the legacy anon key from **View legacy API keys** or update the function authentication mode deliberately.
- **Function not found / 404**: link the CLI to the intended project and deploy `live-earth-data`.
- **“Add FIRMS_MAP_KEY…”**: the function is deployed, but its Supabase Edge Function secret is not set.
- **“Add GEMINI_API_KEY…”**: add the secret in Supabase, then deploy `evidence-assistant`.
- **“Function not found” from Drivers or Applications**: deploy `evidence-assistant` to the Supabase project used by the frontend.
- **ASF has no matching pair**: catalog availability can vary; this is not necessarily an API connection failure.
