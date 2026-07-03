// src/components/ConsentScreen.tsx
interface ConsentScreenProps {
  onAccept: () => void;
}

const CONSENT_TITLE_ID = "privacy-consent-title";

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  return (
    <div
      className="consent-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby={CONSENT_TITLE_ID}
    >
      <div className="consent-screen__panel">
        <p className="consent-screen__brand">Brikaya</p>
        <h2 id={CONSENT_TITLE_ID}>Antes de jogar</h2>
        <p>
          Sua pontuação, recordes e preferências ficam neste aparelho para manter
          sua próxima partida pronta.
        </p>
        <p>
          Esta versão não mostra anúncios reais. Você pode revisar esta escolha
          no menu.
        </p>
        <button
          type="button"
          className="dashboard-button dashboard-button--primary consent-screen__button"
          onClick={onAccept}
        >
          Aceitar e jogar
        </button>
      </div>
    </div>
  );
}
