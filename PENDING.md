<!-- PENDING.md -->
- [ ] Executar `make cloudflare-mobile-qa`, `make cloudflare-no-score-reset`, `make cloudflare-phase-transition-qa`, `make cloudflare-dashboard-layout-qa` e `make cloudflare-theme-qa` contra `https://malnati-brickbreaker.pages.dev/` após merge da feature de controle de velocidade por fase.
- [ ] Validar emissão do certificado TLS do Caddy após apontar o DNS de `brickbreacker.cranio.dev` para o host.
- [ ] Monitorar o endpoint `/healthz` exposto pelo Caddy para integração com monitoramento externo.

- [x] Corrigir sobreposição de HUD/menu/controles sobre o canvas no modo paisagem imersivo mobile/tablet.

- [x] Cloudflare mobile QA publicado obrigatório para iPhone 15, logs, estatísticas, PR e merge automatizado.

- [x] Cloudflare QA publicado garante que pontuação/tijolo não reinicia a bolinha nem o motor.

- [x] Cloudflare QA publicado cobre pausa/toast de próxima fase e dashboard responsivo.

- [x] Design System adaptado apenas às superfícies existentes, com tema claro/escuro e QA publicado obrigatório.

- [x] Validar modo paisagem imersivo mobile/tablet no Cloudflare publicado antes do merge, sem Fullscreen API obrigatória.
