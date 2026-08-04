import { fmtShort } from "./format";

// Module-level — stable references, avoids recharts key collision
export const chartTooltipStyle = { fontSize: 11, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" };
export const pieTooltipFormatter = (v: any, n: any) => [v, n] as [any, any];
export const barTooltipFormatter = (v: any) => fmtShort(Number(v));
