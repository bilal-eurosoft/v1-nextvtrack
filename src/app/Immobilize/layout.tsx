import PostLoginLayout from "../../components/Layouts/PostLoginLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VTrack Immobilize",
  description: "Immobilize",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PostLoginLayout>{children}</PostLoginLayout>;
}
