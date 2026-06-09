// ルートレイアウトは [locale]/layout.tsx に処理を委譲する
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
