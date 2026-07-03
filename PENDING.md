<!-- PENDING.md -->

- [ ] Executar `make cloudflare-mobile-qa`, `make cloudflare-no-score-reset`, `make cloudflare-phase-transition-qa`, `make cloudflare-dashboard-layout-qa` e `make cloudflare-theme-qa` contra `https://malnati-brickbreaker.pages.dev/` após merge da feature de controle de velocidade por fase.
- [ ] Validar emissão do certificado TLS do Caddy após apontar o DNS de `brickbreacker.cranio.dev` para o host.
- [ ] Monitorar o endpoint `/healthz` exposto pelo Caddy para integração com monitoramento externo.

- [x] Adicionar QA publicado para provar funcionamento offline da PWA após o primeiro carregamento.

- [x] Adicionar QA publicado para gameplay básico com pontuação, controles e eventos mínimos.

- [x] Implementar níveis progressivos com aumento de blocos por fase e QA publicado.

- [x] Formalizar power-ups e especiais com telemetria `power_up` e QA publicado.

- [x] Adicionar recordes gerais locais com ranking no menu e QA publicado.

- [x] Formalizar efeitos visuais e sonoros com overlays SVG, áudio local e QA publicado.

- [x] Padronizar nomenclatura semântica e exclusiva de assets runtime visuais e sonoros exibidos/usados pelo jogo.

- [x] Corrigir sobreposição de HUD/menu/controles sobre o canvas no modo paisagem imersivo mobile/tablet.

- [x] Cloudflare mobile QA publicado obrigatório para iPhone 15, logs, estatísticas, PR e merge automatizado.

- [x] Cloudflare QA publicado garante que pontuação/tijolo não reinicia a bolinha nem o motor.

- [x] Cloudflare QA publicado cobre pausa/toast de próxima fase e dashboard responsivo.

- [x] Design System adaptado apenas às superfícies existentes, com tema claro/escuro e QA publicado obrigatório.

- [x] Validar modo paisagem imersivo mobile/tablet no Cloudflare publicado antes do merge, sem Fullscreen API obrigatória.

- [x] Validar preview Cloudflare da feature com tema escuro padrão, versão no menu, quadro full-width e power-up Laser em leque.

- [x] Revisar implementação pós-merge da versão no menu, tema escuro, canvas full-width e Laser em leque, removendo constantes obsoletas sem alterar gameplay.

- [x] Corrigir full-width do tabuleiro, consolidar HUD superior em badge único, mover controles principais para o topo e manter efeito visual do Laser por pelo menos 2s.
