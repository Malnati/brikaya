import { BUILD_VERSION_LABEL } from "../../constants/buildVersion";
import { DASHBOARD_2D_ELEMENTS } from "../../constants/dashboardElements";
import {
  DASHBOARD_2D_ROUTE_PATH,
  DASHBOARD_3D_ROUTE_PATH,
  HOME_ROUTE_PATH,
  type DashboardDimension,
} from "../../routes";
import { DashboardElementCard } from "./DashboardElementCard";

interface DashboardPageProps {
  dimension: DashboardDimension;
}

const DASHBOARD_TABS: Array<{
  dimension: DashboardDimension;
  label: string;
  href: string;
}> = [
  { dimension: "2d", label: "2D", href: DASHBOARD_2D_ROUTE_PATH },
  { dimension: "3d", label: "3D", href: DASHBOARD_3D_ROUTE_PATH },
];

function DashboardHeader({ dimension }: { dimension: DashboardDimension }) {
  return (
    <header className="downloads-header">
      <a
        className="downloads-brand"
        href={HOME_ROUTE_PATH}
        aria-label="Brikaya"
      >
        <span className="downloads-brand__mark" aria-hidden="true">
          B
        </span>
        <span>Brikaya</span>
      </a>
      <div className="dashboard-review-title">
        <h1 id="dashboard-review-title">
          Dashboard de elementos {dimension.toUpperCase()}
        </h1>
        <p
          className="settings-drawer__version"
          aria-label={`Versão do jogo ${BUILD_VERSION_LABEL}`}
        >
          Versão {BUILD_VERSION_LABEL}
        </p>
      </div>
      <nav className="downloads-nav" aria-label="Dimensão do dashboard">
        {DASHBOARD_TABS.map((tab) => (
          <a
            key={tab.dimension}
            href={tab.href}
            aria-current={tab.dimension === dimension ? "page" : undefined}
          >
            {tab.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Dashboard2dContent() {
  return (
    <section
      className="dashboard-element-grid"
      aria-label="Elementos do jogo em 2D"
    >
      {DASHBOARD_2D_ELEMENTS.map((element) => (
        <DashboardElementCard key={element.id} element={element} />
      ))}
    </section>
  );
}

function Dashboard3dContent() {
  return (
    <section
      className="downloads-section dashboard-review-empty"
      aria-label="Elementos do jogo em 3D"
    >
      <h2>Ainda não há elementos 3D</h2>
      <p>
        O Brikaya hoje é renderizado inteiramente em 2D. Este espaço fica
        reservado para quando existir um pipeline de assets 3D — os novos
        elementos aparecerão aqui para revisão antes de irem para o jogo em
        produção.
      </p>
    </section>
  );
}

export function DashboardPage({ dimension }: DashboardPageProps) {
  return (
    <main
      className="downloads-page dashboard-review-page"
      aria-labelledby="dashboard-review-title"
    >
      <DashboardHeader dimension={dimension} />
      {dimension === "2d" ? <Dashboard2dContent /> : <Dashboard3dContent />}
    </main>
  );
}
