import type { ReactNode } from "react";

import type { DashboardElementDescriptor } from "../../constants/dashboardElements";
import { SpriteElementStage } from "./SpriteElementStage";
import { TurretControlStage } from "./TurretControlStage";

interface DashboardElementCardProps {
  element: DashboardElementDescriptor;
}

function renderStage(element: DashboardElementDescriptor): ReactNode {
  if (element.kind === "turret-control") {
    return <TurretControlStage />;
  }

  return (
    <SpriteElementStage src={element.spritePath ?? ""} alt={element.title} />
  );
}

export function DashboardElementCard({ element }: DashboardElementCardProps) {
  return (
    <article className="dashboard-element-card">
      <span className="dashboard-element-card__category">
        {element.category}
      </span>
      {renderStage(element)}
      <h3>{element.title}</h3>
      <p>{element.description}</p>
    </article>
  );
}
