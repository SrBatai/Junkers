import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Last Squad: elige, sobrevive, vence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const root = process.cwd();
const [display, body, background] = await Promise.all([
  readFile(join(root, "assets/fonts/Archivo-ExtraCondensedBlack.ttf")),
  readFile(join(root, "assets/fonts/Archivo-SemiBold.ttf")),
  readFile(join(root, "public/images/final-arena.jpg"), "base64"),
]);

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#0a0a0c",
        color: "#f3f2ee",
      }}
    >
      <img
        src={`data:image/jpeg;base64,${background}`}
        alt=""
        width={1200}
        height={630}
        style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.55 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: "linear-gradient(90deg, #0a0a0c 30%, rgba(10,10,12,0.2))",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Body", fontSize: 30 }}>
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: "#ff2d6b",
              clipPath: "polygon(0 0, 78% 0, 100% 22%, 100% 100%, 22% 100%, 0 78%)",
            }}
          />
          Last Squad
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Display",
            fontSize: 150,
            lineHeight: 0.86,
            textTransform: "uppercase",
            marginTop: 36,
          }}
        >
          <span>Elige.</span>
          <span>Sobrevive.</span>
          <span style={{ color: "#ff2d6b" }}>Vence.</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Body", fontSize: 30, color: "#a6a5ae", marginTop: 36 }}>
          Para los esports de THE FINALS. Si tu equipo cae, caes con él.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 900, style: "normal" },
        { name: "Body", data: body, weight: 600, style: "normal" },
      ],
    },
  );
}
