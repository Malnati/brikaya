// scripts/editorial-page-content.mjs
/** Crawlable editorial pages for the complete EN, PT-BR, and ES-419 search editions. */

export const EDITORIAL_DEFAULT_LOCALE = 'en-US';
export const EDITORIAL_LOCALES = ['en-US', 'pt-BR', 'es-419'];
export const EDITORIAL_LASTMOD = '2026-07-29';
export const EDITORIAL_PATHS = ['/how-to-play/', '/faq/', '/updates/'];

export const MIN_EDITORIAL_MAIN_WORDS = 500;

const SHARED_CSS = `
      :root {
        color-scheme: dark;
        --bg: #080816;
        --panel: #11142a;
        --text: #f8f7ff;
        --muted: #c8c8dc;
        --accent: #7cf4ff;
        --accent-strong: #ffe66d;
        --border: rgba(124, 244, 255, 0.22);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(124, 244, 255, 0.14), transparent 32rem),
          radial-gradient(circle at bottom right, rgba(255, 230, 109, 0.1), transparent 28rem),
          var(--bg);
      }
      main {
        width: min(840px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 64px;
      }
      .top-link { margin: 0 0 32px; }
      .top-link a,
      a { color: var(--accent); }
      header {
        padding: 32px;
        border: 1px solid var(--border);
        border-radius: 28px;
        background: rgba(17, 20, 42, 0.72);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
      }
      h1, h2 { line-height: 1.15; }
      h1 {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4rem);
        letter-spacing: -0.05em;
      }
      h2 {
        margin-top: 0;
        font-size: clamp(1.35rem, 3vw, 1.85rem);
      }
      p, li { color: var(--muted); line-height: 1.7; }
      ul { padding-left: 1.25rem; }
      .lead {
        margin: 18px 0 0;
        font-size: 1.1rem;
      }
      .updated {
        margin: 14px 0 0;
        color: var(--accent-strong);
        font-size: 0.92rem;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        margin-top: 22px;
      }
      section {
        margin-top: 24px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: rgba(17, 20, 42, 0.62);
      }
`;

const NAV = {
  'en-US': [
    ['/play/', 'Play'],
    ['/how-to-play/', 'How to play'],
    ['/faq/', 'FAQ'],
    ['/updates/', 'Updates'],
    ['/about/', 'About'],
    ['/support/', 'Support'],
  ],
  'pt-BR': [
    ['/play/', 'Jogar'],
    ['/how-to-play/', 'Como jogar'],
    ['/faq/', 'FAQ'],
    ['/updates/', 'Atualizações'],
    ['/about/', 'Sobre'],
    ['/support/', 'Suporte'],
  ],
  'es-419': [
    ['/play/', 'Jugar'],
    ['/how-to-play/', 'Cómo jugar'],
    ['/faq/', 'Preguntas frecuentes'],
    ['/updates/', 'Actualizaciones'],
    ['/about/', 'Acerca de'],
    ['/support/', 'Soporte'],
  ],
};

const PAGES = {
  '/how-to-play/': {
    'en-US': {
      title: 'How to play Brikaya',
      description:
        'Learn how to play Brikaya: move the elastic bed, bounce the ball, clear circuit components, and finish levels offline in your browser.',
      h1: 'How to play Brikaya',
      lead:
        'Brikaya is a free circuit-component arcade you play in the browser. This guide explains the goal, controls, scoring, and how to keep playing after the first visit.',
      sections: [
        {
          heading: 'What you are trying to do',
          paragraphs: [
            'Each level places circuit components above an elastic bed. Your job is to keep the ball in play, hit every clearable component, and finish the board without letting the ball fall away. When the board is clear, the level ends and the next one starts with a slightly tougher pace.',
            'Brikaya is meant for short sessions. You can pause through the menu, leave the tab, and return later. Scores, preferences, and progress stay on your device in this version, so you do not need a player account to continue.',
          ],
        },
        {
          heading: 'Controls on desktop and mobile',
          paragraphs: [
            'On desktop, move the elastic bed with the pointer or the keyboard controls shown in the onboarding tip. Keep the bed under the ball so the bounce sends it back into the component field. Timing matters more than raw speed: a centered bounce is usually safer than a late slide.',
            'On phones and tablets, drag across the playfield to shift the bed. Use landscape when your device asks for it, and avoid covering the board with your hand. If the first load finished while you were online, later sessions can continue even without a network connection.',
          ],
        },
        {
          heading: 'Components, ball, and the elastic bed',
          paragraphs: [
            'Components are the targets. Clear them by bouncing the ball into them. Some layouts leave gaps or denser clusters; read the board for a moment before the first hit so you plan a path instead of reacting only after a miss.',
            'The elastic bed is your recovery tool. It absorbs the ball and returns it upward. If the ball slips past the bed, the attempt ends for that life or round according to the current rules on screen. Restart from the menu whenever you want a clean board.',
          ],
        },
        {
          heading: 'Scoring and levels',
          paragraphs: [
            'Hitting components adds to the level score. Clearing a level contributes to your total and can update the local high-score list on that device. Harder levels introduce faster motion and denser arrangements, so early accuracy usually beats reckless swings.',
            'There is no payment wall on this version. Optional ads, when available and allowed, appear only between some completed levels and must not block your ability to keep playing. You can review consent and privacy choices from the game menu.',
          ],
        },
        {
          heading: 'Offline play after the first visit',
          paragraphs: [
            'After the first successful load, Brikaya can keep the main game available offline on that browser and device. Install from the browser when your device offers it if you want a home-screen shortcut. Clearing site data removes local scores and cached files, so export or note records before a reset if they matter to you.',
            'For install steps by platform, open the downloads page. For privacy, terms, and support contacts, use the legal pages linked in the navigation. If something breaks, email contato@brikaya.com with the device, browser, and what you were doing.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'Como jogar Brikaya',
      description:
        'Aprenda a jogar Brikaya: mova a cama elástica, rebata a bola, limpe os componentes de circuito e complete fases no navegador, inclusive offline após o primeiro acesso.',
      h1: 'Como jogar Brikaya',
      lead:
        'Brikaya é um arcade gratuito de componentes de circuito no navegador. Este guia explica o objetivo, os controles, a pontuação e como continuar depois da primeira visita. Também reúne exemplos de recuperação, instalação e uso offline para computador, celular e tablet.',
      sections: [
        {
          heading: 'O que você precisa fazer',
          paragraphs: [
            'Cada fase coloca componentes de circuito acima de uma cama elástica. Seu objetivo é manter a bola em jogo, acertar os componentes que podem ser removidos e limpar o tabuleiro sem deixar a bola escapar. Quando o tabuleiro fica limpo, a fase termina e a seguinte começa com um ritmo um pouco mais exigente.',
            'Brikaya foi feito para sessões rápidas. Você pode pausar pelo menu, sair da aba e voltar depois. Nesta versão, pontuação, preferências e progresso ficam no aparelho, então não é preciso criar conta de jogador para continuar.',
          ],
        },
        {
          heading: 'Controles no computador e no celular',
          paragraphs: [
            'No computador, mova a cama elástica com o ponteiro ou com as teclas indicadas no tutorial inicial. Mantenha a cama sob a bola para que o rebote a devolva ao campo de componentes. Timing importa mais que velocidade bruta: um rebote centralizado costuma ser mais seguro do que um deslize atrasado.',
            'No celular ou tablet, arraste pelo campo de jogo para deslocar a cama. Use a orientação paisagem quando o aparelho pedir e evite cobrir o tabuleiro com a mão. Se o primeiro carregamento terminou com internet, sessões seguintes podem continuar mesmo sem rede.',
          ],
        },
        {
          heading: 'Componentes, bola e cama elástica',
          paragraphs: [
            'Os componentes são os alvos. Limpe-os rebatendo a bola neles. Alguns layouts deixam espaços ou grupos mais densos; observe o tabuleiro por um instante antes do primeiro impacto para planejar um caminho em vez de reagir só depois do erro.',
            'A cama elástica é sua ferramenta de recuperação. Ela recebe a bola e a devolve para cima. Se a bola passar pela cama, a tentativa termina conforme as regras da rodada na tela. Reinicie pelo menu quando quiser um tabuleiro limpo.',
          ],
        },
        {
          heading: 'Pontuação e fases',
          paragraphs: [
            'Acertar componentes aumenta a pontuação da fase. Completar uma fase soma ao total e pode atualizar a lista local de recordes naquele aparelho. Fases mais difíceis trazem movimento mais rápido e arranjos mais densos, então precisão no começo costuma valer mais do que movimentos impulsivos.',
            'Não há barreira de pagamento nesta versão. Anúncios opcionais, quando disponíveis e permitidos, aparecem só entre algumas fases concluídas e não devem impedir que você continue jogando. Revise consentimento e privacidade no menu do jogo.',
          ],
        },
        {
          heading: 'Jogo offline depois da primeira visita',
          paragraphs: [
            'Depois do primeiro carregamento bem-sucedido, Brikaya pode manter o jogo principal disponível offline naquele navegador e aparelho. Instale pelo navegador quando a opção existir se quiser um atalho na tela inicial. Limpar dados do site remove pontuações locais e arquivos em cache, então anote ou exporte o que importar antes de um reset.',
            'Para passos de instalação por plataforma, abra a página de downloads. Para privacidade, termos e suporte, use as páginas legais na navegação. Se algo falhar, escreva para contato@brikaya.com com aparelho, navegador e o que você estava fazendo.',
          ],
        },
      ],
    },
    'es-419': {
      title: 'Cómo jugar Brikaya',
      description:
        'Aprende a jugar Brikaya: mueve la cama elástica, rebota la pelota, elimina componentes de circuito y completa niveles en el navegador, incluso sin conexión después de la primera visita.',
      h1: 'Cómo jugar Brikaya',
      lead:
        'Brikaya es un arcade gratuito de componentes de circuito para jugar en el navegador. Esta guía explica el objetivo, los controles, la puntuación y cómo seguir jugando después de la primera visita.',
      sections: [
        {
          heading: 'Qué debes hacer',
          paragraphs: [
            'Cada nivel coloca componentes de circuito sobre una cama elástica. Tu tarea es mantener la pelota en juego, golpear cada componente que se puede eliminar y despejar el tablero sin dejar que la pelota se caiga. Cuando el tablero queda despejado, el nivel termina y el siguiente empieza con un ritmo un poco más exigente.',
            'Brikaya está pensado para sesiones cortas. Puedes pausar desde el menú, salir de la pestaña y volver después. En esta versión, la puntuación, las preferencias y el progreso permanecen en tu dispositivo, por lo que no necesitas una cuenta de jugador para continuar.',
          ],
        },
        {
          heading: 'Controles en computadora y celular',
          paragraphs: [
            'En computadora, mueve la cama elástica con el puntero o con los controles de teclado que muestra el consejo inicial. Mantén la cama debajo de la pelota para que el rebote la envíe otra vez al campo de componentes. El tiempo importa más que la velocidad: un rebote centrado suele ser más seguro que un desplazamiento tardío.',
            'En teléfonos y tabletas, arrastra sobre el área de juego para desplazar la cama. Usa la orientación horizontal cuando tu dispositivo la solicite y procura no cubrir el tablero con la mano. Si la primera carga terminó mientras estabas conectado, las sesiones posteriores pueden continuar incluso sin conexión.',
          ],
        },
        {
          heading: 'Componentes, pelota y cama elástica',
          paragraphs: [
            'Los componentes son los objetivos. Elimínalos haciendo rebotar la pelota contra ellos. Algunos diseños dejan espacios o grupos más densos; observa el tablero un momento antes del primer golpe para planear una ruta en vez de reaccionar solo después de fallar.',
            'La cama elástica es tu herramienta de recuperación. Recibe la pelota y la devuelve hacia arriba. Si la pelota pasa la cama, el intento termina para esa vida o ronda según las reglas que se muestran en pantalla. Reinicia desde el menú cuando quieras un tablero limpio.',
          ],
        },
        {
          heading: 'Puntuación y niveles',
          paragraphs: [
            'Golpear componentes suma puntos al nivel. Completar un nivel se agrega al total y puede actualizar la lista local de mejores puntuaciones en ese dispositivo. Los niveles más difíciles incorporan movimiento más rápido y diseños más densos, así que la precisión temprana suele valer más que los movimientos imprudentes.',
            'No hay una barrera de pago en esta versión. Los anuncios opcionales, cuando estén disponibles y permitidos, aparecen solo entre algunos niveles terminados y no deben impedirte seguir jugando. Puedes revisar las opciones de consentimiento y privacidad desde el menú del juego.',
          ],
        },
        {
          heading: 'Juego sin conexión después de la primera visita',
          paragraphs: [
            'Después de la primera carga correcta, Brikaya puede mantener el juego principal disponible sin conexión en ese navegador y dispositivo. Instálalo desde el navegador cuando tu dispositivo ofrezca la opción si quieres un acceso directo en la pantalla de inicio. Borrar los datos del sitio elimina las puntuaciones locales y los archivos guardados, así que anota o exporta los registros antes de restablecerlos si te importan.',
            'Para conocer los pasos de instalación por plataforma, abre la página de descargas. Para privacidad, términos y contactos de soporte, usa las páginas legales enlazadas en la navegación. Si algo falla, escribe a contato@brikaya.com con el dispositivo, el navegador y lo que estabas haciendo.',
          ],
        },
      ],
    },
  },
  '/faq/': {
    'en-US': {
      title: 'Brikaya FAQ',
      description:
        'Frequently asked questions about Brikaya: free play, offline mode, privacy, scores, ads, install options, and support.',
      h1: 'Frequently asked questions',
      lead:
        'Short answers about how Brikaya works, what stays on your device, and how to get help without creating a player account. Use these answers before your first run or when returning after an update, changing browsers, installing a home-screen shortcut, or resetting local progress. Each answer points to the relevant guide or trust page when a topic needs more detail.',
      sections: [
        {
          heading: 'Where do I play the game?',
          paragraphs: [
            'Open https://brikaya.com/play/ for the interactive arcade. The home page at https://brikaya.com/ is a readable landing with guides and trust links so you can learn about the product before you start. Both stay on the same domain.',
          ],
        },
        {
          heading: 'Is Brikaya free?',
          paragraphs: [
            'Yes. This version is free to open and play in the browser. There is no required purchase to clear levels or keep local progress. If optional ads appear later, they are meant to stay between levels and must not remove access to play.',
          ],
        },
        {
          heading: 'Do I need an account?',
          paragraphs: [
            'No. Brikaya does not ask for a player login in this version. Scores, language, consent choices, and preferences are stored locally on the device you use. If account features are added later, the public privacy and data-deletion pages will be updated before that change ships.',
          ],
        },
        {
          heading: 'Does it work offline?',
          paragraphs: [
            'After the first load completes while you are online, the main game can keep working offline on that browser. Offline play still depends on what your browser kept cached. Clearing site data or switching browsers starts a fresh local profile.',
          ],
        },
        {
          heading: 'Where are my scores saved?',
          paragraphs: [
            'On the same device and browser where you played. They are not uploaded to a Brikaya player account because that account does not exist here. Use restore defaults in the menu or clear site data in the browser if you want to wipe local records.',
          ],
        },
        {
          heading: 'How do ads and privacy choices work?',
          paragraphs: [
            'Ads are optional for the product experience and are disabled until the runtime allows them. In regions that require consent choices, review the prompts and the cookies page before personalized ads can run. You can revisit consent from the game menu. See the privacy policy for what stays local and how to contact us.',
          ],
        },
        {
          heading: 'Can I install Brikaya on my phone or computer?',
          paragraphs: [
            'Often yes, through the browser install or add-to-home-screen flow when your device offers it. The downloads page explains desktop, Android, and iOS paths in plain language. Installation does not create a store purchase or a Brikaya account.',
          ],
        },
        {
          heading: 'The ball feels too fast or I keep missing. What helps?',
          paragraphs: [
            'Center the bed earlier, watch the first bounce angle, and clear edge components when they give you a safer return path. Restarting a level from the menu is normal. If a control feels broken on a specific browser, include that detail when you write to support.',
          ],
        },
        {
          heading: 'How do I get support?',
          paragraphs: [
            'Email contato@brikaya.com with a short subject, the page or device you used, and the steps that led to the issue. Do not send passwords or unnecessary personal documents. The support page lists the same contact for privacy and data-deletion help.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'FAQ do Brikaya',
      description:
        'Perguntas frequentes sobre Brikaya: jogo grátis, modo offline, privacidade, pontuação, anúncios, instalação e suporte.',
      h1: 'Perguntas frequentes',
      lead:
        'Respostas curtas sobre como o Brikaya funciona, o que fica no seu aparelho e como pedir ajuda sem criar conta de jogador. Consulte estas respostas antes da primeira partida ou ao voltar depois de uma atualização, trocar de navegador, instalar um atalho ou redefinir o progresso local. Cada resposta aponta o guia ou a página de confiança adequada quando o assunto exige mais detalhes.',
      sections: [
        {
          heading: 'Onde eu jogo?',
          paragraphs: [
            'Abra https://brikaya.com/play/ para o arcade interativo. A home em https://brikaya.com/ é uma landing legível com guias e links de confiança para você conhecer o produto antes de começar. As duas ficam no mesmo domínio.',
          ],
        },
        {
          heading: 'O Brikaya é gratuito?',
          paragraphs: [
            'Sim. Esta versão é gratuita para abrir e jogar no navegador. Não há compra obrigatória para limpar fases ou manter progresso local. Se anúncios opcionais aparecerem depois, eles devem ficar entre fases e não remover o acesso ao jogo.',
          ],
        },
        {
          heading: 'Preciso de uma conta?',
          paragraphs: [
            'Não. O Brikaya não pede login de jogador nesta versão. Pontuação, idioma, consentimento e preferências ficam salvos localmente no aparelho que você usa. Se recursos de conta forem adicionados no futuro, as páginas públicas de privacidade e exclusão de dados serão atualizadas antes dessa mudança.',
          ],
        },
        {
          heading: 'Funciona offline?',
          paragraphs: [
            'Depois que o primeiro carregamento termina com internet, o jogo principal pode continuar offline naquele navegador. O modo offline depende do que o navegador guardou em cache. Limpar dados do site ou trocar de navegador começa um perfil local novo.',
          ],
        },
        {
          heading: 'Onde ficam minhas pontuações?',
          paragraphs: [
            'No mesmo aparelho e navegador em que você jogou. Elas não sobem para uma conta Brikaya porque essa conta não existe aqui. Use restaurar padrão no menu ou limpe os dados do site no navegador se quiser apagar os recordes locais.',
          ],
        },
        {
          heading: 'Como funcionam anúncios e privacidade?',
          paragraphs: [
            'Anúncios são opcionais na experiência do produto e permanecem desligados até serem aprovados e disponibilizados. Em regiões que exigem escolha de consentimento, revise os avisos e a página de cookies antes de anúncios personalizados. Você pode revisitar o consentimento no menu do jogo. Veja a política de privacidade para o que fica local e como falar conosco.',
          ],
        },
        {
          heading: 'Posso instalar o Brikaya no celular ou no computador?',
          paragraphs: [
            'Em muitos casos, sim, pelo fluxo de instalação do navegador ou “adicionar à tela inicial” quando o aparelho oferecer. A página de downloads explica os caminhos em desktop, Android e iOS em linguagem simples. A instalação não cria compra em loja nem conta Brikaya.',
          ],
        },
        {
          heading: 'A bola está rápida demais ou eu erro sempre. O que ajuda?',
          paragraphs: [
            'Centralize a cama mais cedo, observe o ângulo do primeiro rebote e limpe componentes das bordas quando isso der um retorno mais seguro. Reiniciar a fase pelo menu é normal. Se um controle parecer quebrado em um navegador específico, inclua esse detalhe ao escrever para o suporte.',
          ],
        },
        {
          heading: 'Como peço suporte?',
          paragraphs: [
            'Escreva para contato@brikaya.com com um assunto curto, a página ou o aparelho usado e os passos que levaram ao problema. Não envie senhas nem documentos pessoais desnecessários. A página de suporte lista o mesmo contato para privacidade e exclusão de dados.',
          ],
        },
      ],
    },
    'es-419': {
      title: 'Preguntas frecuentes de Brikaya',
      description:
        'Preguntas frecuentes sobre Brikaya: juego gratis, modo sin conexión, privacidad, puntuaciones, anuncios, instalación y soporte.',
      h1: 'Preguntas frecuentes',
      lead:
        'Respuestas breves sobre cómo funciona Brikaya, qué permanece en tu dispositivo y cómo pedir ayuda sin crear una cuenta de jugador.',
      sections: [
        {
          heading: '¿Dónde juego?',
          paragraphs: [
            'Abre https://brikaya.com/play/ para acceder al arcade interactivo. La página principal en https://brikaya.com/ es una presentación fácil de leer con guías y enlaces de confianza para que conozcas el producto antes de empezar. Ambas están en el mismo dominio.',
          ],
        },
        {
          heading: '¿Brikaya es gratis?',
          paragraphs: [
            'Sí. Esta versión es gratis para abrir y jugar en el navegador. No hay una compra obligatoria para despejar niveles o conservar el progreso local. Si aparecen anuncios opcionales más adelante, deben quedarse entre niveles y no quitar el acceso al juego.',
          ],
        },
        {
          heading: '¿Necesito una cuenta?',
          paragraphs: [
            'No. Brikaya no solicita inicio de sesión de jugador en esta versión. La puntuación, el idioma, las elecciones de consentimiento y las preferencias se almacenan localmente en el dispositivo que usas. Si en el futuro se agregan funciones de cuenta, las páginas públicas de privacidad y eliminación de datos se actualizarán antes de publicar ese cambio.',
          ],
        },
        {
          heading: '¿Funciona sin conexión?',
          paragraphs: [
            'Después de que la primera carga termina mientras estás conectado, el juego principal puede seguir funcionando sin conexión en ese navegador. El juego sin conexión depende de lo que el navegador haya conservado. Borrar los datos del sitio o cambiar de navegador inicia un perfil local nuevo.',
          ],
        },
        {
          heading: '¿Dónde se guardan mis puntuaciones?',
          paragraphs: [
            'En el mismo dispositivo y navegador donde jugaste. No se cargan a una cuenta de jugador de Brikaya porque esa cuenta no existe aquí. Usa la opción de restaurar valores predeterminados en el menú o borra los datos del sitio en el navegador si quieres eliminar los registros locales.',
          ],
        },
        {
          heading: '¿Cómo funcionan los anuncios y las elecciones de privacidad?',
          paragraphs: [
            'Los anuncios son opcionales para la experiencia del producto y permanecen desactivados hasta que estén disponibles. En regiones que requieren elecciones de consentimiento, revisa los avisos y la página de cookies antes de que se puedan mostrar anuncios personalizados. Puedes volver a revisar el consentimiento desde el menú del juego. Consulta la política de privacidad para saber qué permanece local y cómo contactarnos.',
          ],
        },
        {
          heading: '¿Puedo instalar Brikaya en mi teléfono o computadora?',
          paragraphs: [
            'A menudo sí, mediante el flujo de instalación del navegador o la opción de agregar a la pantalla de inicio cuando tu dispositivo la ofrezca. La página de descargas explica las opciones para computadora, Android e iOS con lenguaje sencillo. La instalación no crea una compra en una tienda ni una cuenta de Brikaya.',
          ],
        },
        {
          heading: 'La pelota se siente demasiado rápida o fallo mucho. ¿Qué ayuda?',
          paragraphs: [
            'Centra la cama antes, observa el ángulo del primer rebote y elimina los componentes de los bordes cuando te den una ruta de regreso más segura. Reiniciar un nivel desde el menú es normal. Si un control parece fallar en un navegador específico, incluye ese detalle cuando escribas al soporte.',
          ],
        },
        {
          heading: '¿Cómo obtengo soporte?',
          paragraphs: [
            'Escribe a contato@brikaya.com con un asunto breve, la página o el dispositivo que usaste y los pasos que llevaron al problema. No envíes contraseñas ni documentos personales innecesarios. La página de soporte muestra el mismo contacto para ayuda con privacidad y eliminación de datos.',
          ],
        },
      ],
    },
  },
  '/updates/': {
    'en-US': {
      title: 'Brikaya updates and design notes',
      description:
        'Product updates and design notes for Brikaya: offline-first arcade play, public trust pages, and editorial guides for players.',
      h1: 'Updates and design notes',
      lead:
        'A plain-language log of what Brikaya is building for players: free browser play, local progress, and clearer public information. Entries focus on changes a visitor can use or notice, with links to the guides that explain the current experience.',
      sections: [
        {
          heading: '2026-07-16 — Home page, /play/, and reliable returns after updates',
          paragraphs: [
            'The public home at https://brikaya.com/ now explains the product before play and links directly to How to play, FAQ, Updates, downloads, privacy, terms, and support. The interactive arcade has its own address at https://brikaya.com/play/, so a visitor can choose between reading and starting a run without losing the connection between both experiences.',
            'Returning players also receive a clearer recovery path after an update. Installed shortcuts that still open the home page are guided to /play/, and the browser refreshes the files needed for the current version. This reduces blank screens while preserving offline play after a successful online load.',
          ],
        },
        {
          heading: '2026-07 — Player guides and site readiness',
          paragraphs: [
            'We published complete How to play, FAQ, and Updates pages in English, Brazilian Portuguese, and Latin American Spanish. They explain gameplay, privacy expectations, local progress, and installation without requiring a login, so visitors can understand the product from stable pages rather than only from the interactive board.',
            'About, privacy, terms, data deletion, cookies, and support were expanded in the same three editions with direct navigation and clear contact paths. Other player languages remain available inside the game, while public reading editions are added only when their full set of guides and trust pages is ready.',
          ],
        },
        {
          heading: 'Design intent of the arcade',
          paragraphs: [
            'Brikaya treats circuit components as the visual language of a classic clear-the-board arcade. The elastic bed replaces a rigid paddle metaphor so motion feels springy and readable in short sessions. Levels should stay understandable at a glance: what to hit, where the ball is going, and how to recover after a bad bounce.',
            'The product stays offline-first after the first load. That choice keeps play available on flaky networks and avoids forcing an account for basic progress. Optional advertising, if ever enabled, is constrained to between-level moments so it does not fight the core control loop.',
          ],
        },
        {
          heading: 'What we optimize for',
          paragraphs: [
            'Clarity over spectacle: players should learn the loop in seconds. Privacy over profile: local storage beats mandatory signup for this version. Stable public pages over marketing noise: about, legal, support, and the guides should answer real questions without internal jargon.',
            'We will keep expanding player-facing notes here when features change. If you need help between updates, use contato@brikaya.com and include the browser and device you used.',
          ],
        },
        {
          heading: 'Earlier foundation',
          paragraphs: [
            'Before these guides, Brikaya already offered free browser play, local high scores, installation guidance, and links to privacy, terms, about, and legal information from the game menu. Players could leave the board and read those notices without creating an account.',
            'The downloads page still explains browser installation and offline continuation. The expanded home, guides, and trust pages now add the context a first-time visitor needs before playing and give returning players reliable references for controls, privacy, updates, and support.',
          ],
        },
      ],
    },
    'pt-BR': {
      title: 'Atualizações e notas de design do Brikaya',
      description:
        'Atualizações e notas de design do Brikaya: arcade offline-first, páginas públicas de confiança e guias editoriais para jogadores.',
      h1: 'Atualizações e notas de design',
      lead:
        'Um registro em linguagem simples do que o Brikaya constrói para jogadores: jogo gratuito no navegador, progresso local e informação pública mais clara.',
      sections: [
        {
          heading: '2026-07-16 — Página inicial, /play/ e retorno confiável após atualizações',
          paragraphs: [
            'A página pública em https://brikaya.com/ apresenta o produto antes da partida e liga diretamente a Como jogar, FAQ, Atualizações, downloads, privacidade, termos e suporte. O arcade interativo possui endereço próprio em https://brikaya.com/play/, permitindo escolher entre ler e começar uma rodada sem separar as duas experiências.',
            'Jogadores que retornam também recebem um caminho mais claro depois de uma atualização. Atalhos instalados que ainda abrem a página inicial são direcionados para /play/, e o navegador atualiza os arquivos necessários para a versão atual. Isso reduz telas em branco e preserva o uso offline depois de um carregamento online concluído.',
          ],
        },
        {
          heading: '2026-07 — Guias do jogador e prontidão do site',
          paragraphs: [
            'Publicamos páginas completas de Como jogar, FAQ e Atualizações em inglês, português do Brasil e espanhol latino-americano. Elas explicam jogabilidade, privacidade, progresso local e instalação sem exigir login, para que qualquer visitante compreenda o produto antes de abrir o tabuleiro.',
            'Sobre, privacidade, termos, exclusão de dados, cookies e suporte foram reforçados nas mesmas três edições, com navegação direta e caminhos claros de contato. Outros idiomas continuam disponíveis dentro do jogo; novas edições públicas de leitura só entram quando todo o conjunto de guias e páginas de confiança estiver pronto.',
          ],
        },
        {
          heading: 'Intenção de design do arcade',
          paragraphs: [
            'O Brikaya trata componentes de circuito como linguagem visual de um arcade clássico de limpar o tabuleiro. A cama elástica substitui a metáfora de raquete rígida para o movimento parecer elástico e legível em sessões curtas. As fases devem ser compreensíveis de relance: o que acertar, para onde a bola vai e como recuperar depois de um rebote ruim.',
            'O produto permanece offline-first depois do primeiro carregamento. Essa escolha mantém o jogo disponível em redes instáveis e evita forçar conta para progresso básico. Publicidade opcional, se algum dia for ativada, fica restrita a momentos entre fases para não disputar o controle principal.',
          ],
        },
        {
          heading: 'O que priorizamos',
          paragraphs: [
            'Clareza em vez de espetáculo: o jogador deve aprender o loop em segundos. Privacidade em vez de perfil: armazenamento local supera cadastro obrigatório nesta versão. Páginas públicas estáveis em vez de ruído de marketing: sobre, legal, suporte e os guias devem responder perguntas reais sem jargão interno.',
            'Vamos continuar expandindo notas para jogadores aqui quando os recursos mudarem. Se precisar de ajuda entre atualizações, use contato@brikaya.com e inclua o navegador e o aparelho usados.',
          ],
        },
        {
          heading: 'Base anterior',
          paragraphs: [
            'Antes destes guias, o Brikaya já oferecia jogo gratuito no navegador, recordes locais, orientação de instalação e links de privacidade, termos, sobre e informações jurídicas no menu. O jogador podia sair do tabuleiro e consultar essas páginas sem criar conta.',
            'Downloads continua explicando a instalação pelo navegador e a continuidade offline. A página inicial, os guias e as páginas de confiança agora acrescentam o contexto necessário para quem deseja ler antes de jogar e referências confiáveis para controles, privacidade, mudanças e suporte.',
          ],
        },
      ],
    },
    'es-419': {
      title: 'Actualizaciones y notas de diseño de Brikaya',
      description:
        'Actualizaciones y notas de diseño de Brikaya: arcade sin conexión después de la primera carga, páginas públicas de confianza y guías editoriales para jugadores.',
      h1: 'Actualizaciones y notas de diseño',
      lead:
        'Un registro en lenguaje sencillo de lo que Brikaya desarrolla para los jugadores: juego gratuito en el navegador, progreso local e información pública más clara.',
      sections: [
        {
          heading: '2026-07-16 — Presentación, /play/ y recuperación después de una actualización',
          paragraphs: [
            'La página principal pública en https://brikaya.com/ explica el producto e incluye enlaces a cómo jugar, preguntas frecuentes, actualizaciones, descargas y páginas de confianza. El arcade interactivo funciona en https://brikaya.com/play/ dentro del mismo sitio para que el acceso sin conexión y las elecciones de privacidad permanezcan en un solo lugar.',
            'Una actualización mejora la forma en que se recupera el juego después de cambiar de versión. La presentación también pide que las versiones instaladas se actualicen y, si todavía abren la dirección principal, las dirige a /play/. Esto ayuda a recuperar pantallas en blanco que podían aparecer al abrir una versión guardada anteriormente.',
          ],
        },
        {
          heading: '2026-07 — Guías para jugadores e información pública',
          paragraphs: [
            'Publicamos páginas de cómo jugar, preguntas frecuentes y actualizaciones en inglés, portugués brasileño y español latinoamericano. Estas páginas explican la jugabilidad, las expectativas de privacidad y las opciones de instalación sin exigir inicio de sesión. Existen para que visitantes y revisores entiendan el producto desde direcciones estables, no solo desde la pantalla interactiva.',
            'Las páginas legales y de confianza, como acerca de, privacidad, términos, soporte y avisos relacionados, siguen disponibles como referencias públicas y se ampliaron en inglés con detalles más claros sobre /play/, los datos guardados en el dispositivo y las formas de contacto. Las páginas editoriales se limitan a estas tres ediciones completas para que las personas encuentren una guía completa y útil en su idioma.',
          ],
        },
        {
          heading: 'Intención de diseño del arcade',
          paragraphs: [
            'Brikaya trata los componentes de circuito como el lenguaje visual de un arcade clásico de despejar el tablero. La cama elástica reemplaza la metáfora de una paleta rígida para que el movimiento se sienta elástico y fácil de leer en sesiones cortas. Los niveles deben entenderse de un vistazo: qué golpear, hacia dónde va la pelota y cómo recuperarse después de un mal rebote.',
            'El producto sigue priorizando el juego sin conexión después de la primera carga. Esa decisión mantiene el juego disponible en redes inestables y evita obligar a crear una cuenta para el progreso básico. La publicidad opcional, si alguna vez se activa, queda limitada a momentos entre niveles para no competir con el control principal.',
          ],
        },
        {
          heading: 'Lo que priorizamos',
          paragraphs: [
            'Claridad antes que espectáculo: los jugadores deben aprender el ciclo en segundos. Privacidad antes que perfil: el almacenamiento local es mejor que un registro obligatorio en esta versión. Páginas públicas estables antes que ruido de marketing: acerca de, legal, soporte y las guías deben responder preguntas reales sin jerga interna.',
            'Seguiremos ampliando estas notas para jugadores cuando cambien las funciones. Si necesitas ayuda entre actualizaciones, usa contato@brikaya.com e incluye el navegador y el dispositivo que usaste.',
          ],
        },
        {
          heading: 'Base anterior',
          paragraphs: [
            'Antes de estas guías, Brikaya ya existía como un arcade gratuito con acceso desde el navegador en brikaya.com, con presentaciones localizadas de inicio y descargas, páginas legales para revisiones de plataforma y mejores puntuaciones locales. El menú del juego ya mostraba enlaces de privacidad, términos, acerca de y legal para que los jugadores pudieran salir de la pantalla de juego y leer las políticas.',
            'La página de descargas explicaba la instalación desde el navegador y la continuidad sin conexión. Esa base se mantiene; las páginas editoriales y la presentación agregan una profundidad que una sola pantalla interactiva no puede dar a los buscadores ni a los visitantes que quieren leer antes de jugar.',
          ],
        },
      ],
    },
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function linkifyContact(html) {
  return html.replaceAll(
    'contato@brikaya.com',
    '<a href="mailto:contato@brikaya.com">contato@brikaya.com</a>',
  );
}

export function editorialLocalePath(locale, routePath) {
  if (locale === EDITORIAL_DEFAULT_LOCALE) return routePath;
  return `/${locale}${routePath}`;
}

function navHref(locale, itemPath) {
  if (itemPath === '/') return '/';
  if (itemPath === '/play/') {
    return locale === EDITORIAL_DEFAULT_LOCALE || locale === 'pt-BR'
      ? '/play/'
      : `/${locale}/play/`;
  }
  if (EDITORIAL_PATHS.includes(itemPath)) return editorialLocalePath(locale, itemPath);
  return locale === EDITORIAL_DEFAULT_LOCALE ? itemPath : `/${locale}${itemPath}`;
}

export function countEditorialMainWords(locale, path) {
  const page = PAGES[path]?.[locale];
  if (!page) return 0;
  const parts = [page.h1, page.lead, ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs])];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

export function editorialPageFor(locale, path) {
  return PAGES[path]?.[locale] ?? null;
}

export function renderEditorialPage({ locale, path, canonicalUrl, alternateLinks, dir }) {
  const page = PAGES[path]?.[locale];
  if (!page) throw new Error(`unknown editorial page: ${locale} ${path}`);

  const navItems = NAV[locale] ?? NAV['en-US'];
  const updatedLabel = locale === 'pt-BR'
    ? `Última atualização: ${EDITORIAL_LASTMOD}`
    : locale === 'es-419'
      ? `Última actualización: ${EDITORIAL_LASTMOD}`
      : `Last updated: ${EDITORIAL_LASTMOD}`;
  const backLabel = locale === 'pt-BR'
    ? 'Voltar ao jogo'
    : locale === 'es-419'
      ? 'Volver al juego'
      : 'Back to the game';

  const navHtml = navItems
    .map(([itemPath, label]) => {
      return `          <a href="${escapeHtml(navHref(locale, itemPath))}">${escapeHtml(label)}</a>`;
    })
    .join('\n');
  const sectionsHtml = page.sections
    .map((section, index) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `        <p>${linkifyContact(escapeHtml(paragraph))}</p>`)
        .join('\n');
      const className = index === 0 ? ' class="note"' : '';
      return `      <section${className}>\n        <h2>${escapeHtml(section.heading)}</h2>\n${paragraphs}\n      </section>`;
    })
    .join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Brikaya',
      url: 'https://brikaya.com/',
    },
    publisher: {
      '@type': 'Person',
      name: 'Ricardo Malnati',
    },
    dateModified: EDITORIAL_LASTMOD,
  };

  return `<!-- generated by scripts/generate-localized-seo.mjs -->\n<!doctype html>\n<html lang="${escapeHtml(locale)}" dir="${escapeHtml(dir)}">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />\n    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n    <meta name="description" content="${escapeHtml(page.description)}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n    <meta property="og:title" content="${escapeHtml(page.title)}" />\n    <meta property="og:description" content="${escapeHtml(page.description)}" />\n    <meta name="twitter:card" content="summary" />\n    <meta name="twitter:title" content="${escapeHtml(page.title)}" />\n    <meta name="twitter:description" content="${escapeHtml(page.description)}" />\n    <meta name="robots" content="index,follow" />\n${alternateLinks}\n    <title>${escapeHtml(page.title)}</title>\n    <script type="application/ld+json">\n${escapeJsonForHtml(jsonLd)}\n    </script>\n    <style>${SHARED_CSS}\n    </style>\n  </head>\n  <body>\n    <main>\n      <p class="top-link"><a href="/play/">${escapeHtml(backLabel)}</a></p>\n      <header>\n        <h1>${escapeHtml(page.h1)}</h1>\n        <p class="lead">${escapeHtml(page.lead)}</p>\n        <p class="updated">${escapeHtml(updatedLabel)}</p>\n        <nav aria-label="Brikaya">\n${navHtml}\n        </nav>\n      </header>\n${sectionsHtml}\n    </main>\n  </body>\n</html>\n`;
}
