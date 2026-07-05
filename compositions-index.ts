import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ── Colors ──
const COLORS = {
  bg: "#0f172a",
  purple: "#6d28d9",
  purpleLight: "#a78bfa",
  purpleSoft: "#ede9fe",
  white: "#ffffff",
  gray: "#94a3b8",
  green: "#059669",
  red: "#dc2626",
  amber: "#d97706",
};

// ── Reusable Components ──

const BrandBar = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      width: "100%",
      height: 80,
      background: "rgba(10,15,30,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    }}
  >
    <span
      style={{
        color: COLORS.purpleLight,
        fontFamily: "Arial, sans-serif",
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: 3,
      }}
    >
      NEURALPAWS
    </span>
  </div>
);

const ProgressBar = ({ progress }) => (
  <div
    style={{
      position: "absolute",
      top: 80,
      left: 60,
      right: 60,
      height: 6,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 3,
      zIndex: 100,
    }}
  >
    <div
      style={{
        width: `${progress * 100}%`,
        height: "100%",
        background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purpleLight})`,
        borderRadius: 3,
        transition: "width 0.3s ease",
      }}
    />
  </div>
);

const FadeSlide = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 10], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const ScoreBadge = ({ score, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        background: COLORS.purple,
        borderRadius: 16,
        padding: "16px 32px",
      }}
    >
      <span style={{ fontSize: 48, fontWeight: 800, color: COLORS.white }}>{score}</span>
      <span style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{label}</span>
    </div>
  );
};

// ── Slide Components ──

const HookSlide = ({ toolName, price, score, category }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSpring = spring({ frame, fps, config: { damping: 12 } });
  const priceSpring = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const scoreSpring = spring({ frame: frame - 20, fps, config: { damping: 10 } });

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: COLORS.gray, fontSize: 36, fontWeight: 600, marginBottom: 20, transform: `scale(${titleSpring})` }}>IS</div>
          <div style={{ color: COLORS.white, fontSize: 80, fontWeight: 800, marginBottom: 30, transform: `scale(${titleSpring})` }}>{toolName}</div>
          <div style={{ color: COLORS.gray, fontSize: 36, fontWeight: 600, marginBottom: 20, transform: `scale(${priceSpring})` }}>WORTH</div>
          <div style={{ color: COLORS.purpleLight, fontSize: 80, fontWeight: 800, marginBottom: 40, transform: `scale(${priceSpring})` }}>{price}?</div>
          <div style={{ color: COLORS.gray, fontSize: 28, marginBottom: 60 }}>{category} Review 2026</div>
          <div style={{ transform: `scale(${scoreSpring})` }}>
            <ScoreBadge score={score} label="/ 5" />
          </div>
        </div>
      </AbsoluteFill>
    </FadeSlide>
  );
};

const WhatSlide = ({ text, stats }) => (
  <FadeSlide>
    <BrandBar />
    <AbsoluteFill style={{ background: COLORS.bg, padding: 60, paddingTop: 180 }}>
      <div style={{ color: COLORS.purpleLight, fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 40 }}>WHAT IS IT?</div>
      <div style={{ color: COLORS.white, fontSize: 38, lineHeight: 1.5, marginBottom: 60 }}>{text}</div>
      <div style={{ display: "flex", gap: 40 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ color: COLORS.purpleLight, fontSize: 52, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: COLORS.gray, fontSize: 24, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  </FadeSlide>
);

const FeatureSlide = ({ label, title, text, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconScale = spring({ frame: frame - 5, fps, config: { damping: 8, mass: 0.5 } });

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, padding: 60, paddingTop: 180 }}>
        <div style={{ color: COLORS.purpleLight, fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 60 }}>{label}</div>
        <div style={{ fontSize: 80, textAlign: "center", marginBottom: 30, transform: `scale(${iconScale})` }}>{icon}</div>
        <div style={{ color: COLORS.white, fontSize: 52, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>{title}</div>
        <div style={{ color: COLORS.gray, fontSize: 36, lineHeight: 1.5, textAlign: "center", padding: "0 20px" }}>{text}</div>
      </AbsoluteFill>
    </FadeSlide>
  );
};

const WarningSlide = ({ text, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boxSpring = spring({ frame: frame - 5, fps, config: { damping: 12 } });

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, padding: 60, paddingTop: 180 }}>
        <div style={{ color: COLORS.red, fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 60 }}>THE REAL CON</div>
        <div
          style={{
            background: "rgba(220,38,38,0.08)",
            border: `2px solid ${COLORS.red}`,
            borderRadius: 20,
            padding: 40,
            transform: `scale(${boxSpring})`,
          }}
        >
          <div style={{ fontSize: 60, textAlign: "center", marginBottom: 20 }}>⚠️</div>
          <div style={{ color: COLORS.white, fontSize: 36, lineHeight: 1.5 }}>{text}</div>
        </div>
        <div style={{ color: COLORS.gray, fontSize: 30, lineHeight: 1.5, marginTop: 40 }}>{subtext}</div>
      </AbsoluteFill>
    </FadeSlide>
  );
};

const CompareSlide = ({ competitors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, padding: 60, paddingTop: 180 }}>
        <div style={{ color: COLORS.purpleLight, fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 50 }}>VS THE COMPETITION</div>
        {competitors.map((c, i) => {
          const cardSpring = spring({ frame: frame - i * 6, fps, config: { damping: 12 } });
          return (
            <div
              key={i}
              style={{
                background: c.highlight ? COLORS.purple : "rgba(30,40,60,0.8)",
                borderRadius: 16,
                padding: "24px 32px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transform: `scale(${cardSpring})`,
              }}
            >
              <div>
                <div style={{ color: COLORS.white, fontSize: 36, fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: c.highlight ? "rgba(200,200,255,0.8)" : COLORS.gray, fontSize: 26, marginTop: 4 }}>{c.price}</div>
              </div>
              <div
                style={{
                  background: parseFloat(c.score) >= 4.0 ? COLORS.green : COLORS.amber,
                  borderRadius: 12,
                  padding: "12px 24px",
                }}
              >
                <span style={{ color: COLORS.white, fontSize: 32, fontWeight: 800 }}>{c.score}</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </FadeSlide>
  );
};

const VerdictSlide = ({ score, label, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scoreScale = spring({ frame: frame - 5, fps, config: { damping: 8, mass: 0.8 } });

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, padding: 60, paddingTop: 180, alignItems: "center" }}>
        <div style={{ color: COLORS.purpleLight, fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: 60 }}>FINAL VERDICT</div>
        <div style={{ transform: `scale(${scoreScale})`, textAlign: "center" }}>
          <div style={{ color: COLORS.white, fontSize: 160, fontWeight: 800 }}>{score}</div>
          <div style={{ color: COLORS.gray, fontSize: 48, marginTop: -10 }}>/ 5</div>
        </div>
        <div
          style={{
            background: COLORS.purple,
            borderRadius: 14,
            padding: "14px 40px",
            marginTop: 40,
            marginBottom: 50,
          }}
        >
          <span style={{ color: COLORS.white, fontSize: 28, fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ color: COLORS.gray, fontSize: 32, lineHeight: 1.5, textAlign: "center", padding: "0 20px" }}>{text}</div>
      </AbsoluteFill>
    </FadeSlide>
  );
};

const CTASlide = ({ toolName, siteUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btnScale = spring({ frame: frame - 15, fps, config: { damping: 10 } });

  return (
    <FadeSlide>
      <BrandBar />
      <AbsoluteFill style={{ background: COLORS.bg, padding: 60, justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: COLORS.gray, fontSize: 36, fontWeight: 600, marginBottom: 30 }}>FULL REVIEW</div>
        <div style={{ color: COLORS.purpleLight, fontSize: 72, fontWeight: 800, marginBottom: 40 }}>neuralpaws.com</div>
        <div style={{ color: COLORS.white, fontSize: 42, fontWeight: 700, marginBottom: 20 }}>{toolName} Review 2026</div>
        <div style={{ color: COLORS.gray, fontSize: 28, marginBottom: 80 }}>Pricing • Comparison • Pros & Cons • FAQ</div>
        <div
          style={{
            background: COLORS.red,
            borderRadius: 14,
            padding: "18px 60px",
            transform: `scale(${btnScale})`,
          }}
        >
          <span style={{ color: COLORS.white, fontSize: 36, fontWeight: 700 }}>SUBSCRIBE</span>
        </div>
      </AbsoluteFill>
    </FadeSlide>
  );
};

// ── Main Composition ──

export const ReviewShort = ({
  toolName = "Wispr Flow",
  price = "$15/month",
  score = "4.2",
  category = "AI Dictation Tool",
  whatText = "Wispr Flow is an AI dictation app that works across every app. Speak naturally — it formats for Slack, Gmail, Notion, or code editors automatically.",
  stats = [
    { value: "150+", label: "WPM" },
    { value: "100+", label: "Languages" },
    { value: "4", label: "Platforms" },
  ],
  featureLabel = "KILLER FEATURE",
  featureIcon = "🎛️",
  featureTitle = "Command Mode",
  featureText = "Highlight text, say 'make this concise' — the AI rewrites in place.",
  warningText = "Screenshots your screen every few seconds. Data goes to cloud servers. No offline mode.",
  warningSub = "If you handle confidential data, this is a structural dealbreaker.",
  competitors = [
    { name: "Wispr Flow", price: "$15/mo", score: "4.2", highlight: true },
    { name: "Superwhisper", price: "$8.49/mo", score: "4.5", highlight: false },
    { name: "Willow Voice", price: "$12/mo", score: "4.3", highlight: false },
  ],
  verdictLabel = "Best Cross-Platform Dictation",
  verdictText = "Best cross-platform AI dictation in 2026. The privacy trade-off is real — but nothing else covers all four platforms this well.",
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const slideDurations = [5, 7, 7, 7, 6, 6, 5]; // seconds
  const slideFrames = slideDurations.map((d) => d * fps);
  let cumulative = 0;
  const slideStarts = slideFrames.map((f) => {
    const start = cumulative;
    cumulative += f;
    return start;
  });

  const totalProgress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <ProgressBar progress={totalProgress} />

      <Sequence from={slideStarts[0]} durationInFrames={slideFrames[0]}>
        <HookSlide toolName={toolName} price={price} score={score} category={category} />
      </Sequence>

      <Sequence from={slideStarts[1]} durationInFrames={slideFrames[1]}>
        <WhatSlide text={whatText} stats={stats} />
      </Sequence>

      <Sequence from={slideStarts[2]} durationInFrames={slideFrames[2]}>
        <FeatureSlide label={featureLabel} icon={featureIcon} title={featureTitle} text={featureText} />
      </Sequence>

      <Sequence from={slideStarts[3]} durationInFrames={slideFrames[3]}>
        <WarningSlide text={warningText} subtext={warningSub} />
      </Sequence>

      <Sequence from={slideStarts[4]} durationInFrames={slideFrames[4]}>
        <CompareSlide competitors={competitors} />
      </Sequence>

      <Sequence from={slideStarts[5]} durationInFrames={slideFrames[5]}>
        <VerdictSlide score={score} label={verdictLabel} text={verdictText} />
      </Sequence>

      <Sequence from={slideStarts[6]} durationInFrames={slideFrames[6]}>
        <CTASlide toolName={toolName} siteUrl="neuralpaws.com" />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Register ──

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ReviewShort"
        component={ReviewShort}
        durationInFrames={43 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
