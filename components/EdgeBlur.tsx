


export default function EdgeBlur() {
  return (
    <>
      <div className="edge-blur edge-blur-top" aria-hidden="true">
        <div className="eb-layer eb-1" />
        <div className="eb-layer eb-2" />
        <div className="eb-layer eb-3" />
      </div>
      <div className="edge-blur edge-blur-bottom" aria-hidden="true">
        <div className="eb-layer eb-1" />
        <div className="eb-layer eb-2" />
        <div className="eb-layer eb-3" />
      </div>
    </>
  );
}
