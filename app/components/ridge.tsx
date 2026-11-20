/** The ridge in Juniper Ridge: two layers of foothills under the name. Decorative only. */
export function Ridge() {
  return (
    <svg
      className="ridge"
      viewBox="0 0 1200 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="far"
        d="M0 84 C 90 70, 150 40, 240 46 S 380 82, 470 60 S 610 22, 700 30 S 860 74, 960 56 S 1110 34, 1200 44 L1200 140 L0 140 Z"
      />
      <path
        className="near"
        d="M0 112 C 110 96, 190 78, 300 86 S 470 116, 590 100 S 760 66, 880 76 S 1080 108, 1200 94 L1200 140 L0 140 Z"
      />
    </svg>
  );
}
