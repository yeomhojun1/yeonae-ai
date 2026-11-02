// lucide 아이콘 경로 (24px 기준, 선 굵기 1.5). 이모지 대신 이 한 세트만 쓴다.
const PATHS = {
  paperclip: ["m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"],
  lock: ["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z", "M7 11V7a5 5 0 0 1 10 0v4"],
  file: ["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", "M14 2v4a2 2 0 0 0 2 2h4", "M16 13H8", "M16 17H8"],
  copy: ["M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"],
  check: ["M20 6 9 17l-5-5"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  message: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"],
  flag: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"],
  compass: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  loader: ["M21 12a9 9 0 1 1-6.219-8.56"],
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
