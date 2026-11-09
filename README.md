# Front — Landing, inscription, espace participant, back-office
Vite 8 · React 19 · TanStack Router/Query · Tailwind 4 (structure inspirée de front_InstaPoint).

    npm install
    cp .env.example .env     # VITE_API_URL
    npm run dev              # http://localhost:5180 (port fixe ; doit être égal à FRONT_URL dans backend/.env)

Routes : `/` landing · `/inscription` (e-mail → lien → formulaire) · `/connexion` · `/espace` · `/admin/*` · `/verification/:code`
Contenu de la landing (intervenants, tarifs, calendrier…) : fourni par l'API (`GET /api/public/colloque`, données dans `AppFixtures`).

## CI / CD
- `.github/workflows/ci.yml` : à chaque push sur `main` et chaque PR → `npm ci`, build Vite, typecheck.
- `.github/workflows/deploy.yml` : push sur la branche **`production`** → build avec `VITE_API_URL=https://backforum.instapoint.site/api`, envoi par SCP vers `/var/www/forum.instapoint.site/web`, puis vérification HTTP.
- Secrets GitHub requis (Settings → Secrets → Actions) : `APP_HOST`, `APP_USER`, `APP_PASS`.
- Production : http://forum.instapoint.site (HTTPS dès que les certificats sont actifs : variable GitHub `USE_HTTPS=true`, puis relancer le déploiement) — `public/.htaccess` gère le routage SPA, le cache et les en-têtes de sécurité.
