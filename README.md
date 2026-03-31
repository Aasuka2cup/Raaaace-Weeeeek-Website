# F1 Fantasy Website

Static-friendly Next.js site for presenting F1 Fantasy league analysis, pick distribution, and prediction insights.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data source

This site consumes the exported package from the strategist repo and expects the files under:

```text
public/data/league-data/
```

The sample dataset currently copied into this repo came from:

```text
/Users/aasuka/Projects/interests/F1 Fantasy/F1-Fantasy-Strategist/build/league-site-data/
```

## Build

```bash
npm run build
```

The project uses `output: "export"` in `next.config.ts`, so it can be deployed as a static site.

## Deployment

Target domain:

```text
f1fantasy.aasuka.com
```

Recommended hosting options:

- Vercel with the custom domain connected to `f1fantasy.aasuka.com`
- Netlify with the same custom domain pointed at the deployed site

Whenever the strategist export package changes, copy or sync the latest JSON into `public/data/league-data/` and redeploy.
