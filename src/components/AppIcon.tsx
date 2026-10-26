// Rendered to PNG by next/og for the favicon, the iPhone home-screen icon and the manifest.
export function AppIconArt({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #4338ca 60%, #312e81 100%)",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <div
        style={{
          width: size * 0.56,
          height: size * 0.42,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: size * 0.06,
          borderRadius: size * 0.08,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <div style={{ height: size * 0.05, width: "60%", borderRadius: size, background: "#4f46e5", display: "flex" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ height: size * 0.04, width: "35%", borderRadius: size, background: "#c7d2fe", display: "flex" }} />
          <div style={{ height: size * 0.1, width: size * 0.1, borderRadius: size, background: "#10b981", display: "flex" }} />
        </div>
      </div>
    </div>
  );
}
