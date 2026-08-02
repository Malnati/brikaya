interface SpriteElementStageProps {
  src: string;
  alt: string;
}

export function SpriteElementStage({ src, alt }: SpriteElementStageProps) {
  return (
    <div className="dashboard-element-stage">
      <img src={src} alt={alt} />
    </div>
  );
}
