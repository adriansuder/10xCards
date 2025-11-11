Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing - Kompleksowa infrastruktura testowa:
- Vitest v2.0+ do testów jednostkowych i integracyjnych (szybszy od Jest, natywne wsparcie ESM)
- Playwright v1.47+ do testów end-to-end (lepsze API niż Cypress, obsługa wielu przeglądarek)
- @testing-library/react v16.0+ do testowania komponentów React
- axe-core do automatycznych testów dostępności (WCAG compliance)
- k6 / Artillery do testów wydajnościowych i obciążeniowych
- pgTAP (opcjonalnie) do testowania funkcji PostgreSQL
- OWASP ZAP do skanowania bezpieczeństwa

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD z automatycznymi testami
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
- Codecov do raportowania pokrycia kodu testami
- Sentry do monitorowania błędów w produkcji