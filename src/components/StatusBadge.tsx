import type { StatusState } from "@prisma/client";

type Props = {
  state: StatusState | null;
  locale: string;
};

const CONFIG: Record<
  StatusState,
  { label: { ja: string; en: string }; dotColor: string; textColor: string }
> = {
  OPEN: {
    label: { ja: "営業中", en: "Open" },
    dotColor: "#5E7E63", // sage
    textColor: "#5E7E63",
  },
  CLOSED: {
    label: { ja: "休業", en: "Closed" },
    dotColor: "#8A8276", // ink-faint
    textColor: "#8A8276",
  },
  BREAK: {
    label: { ja: "休憩中", en: "On Break" },
    dotColor: "#A8835A", // clay
    textColor: "#A8835A",
  },
};

export default function StatusBadge({ state, locale }: Props) {
  if (!state) return null;
  const { label, dotColor, textColor } = CONFIG[state];
  const text = locale === "ja" ? label.ja : label.en;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] leading-none"
      style={{ color: textColor }}
      aria-label={text}
    >
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{ width: 6, height: 6, backgroundColor: dotColor }}
        aria-hidden="true"
      />
      {text}
    </span>
  );
}
