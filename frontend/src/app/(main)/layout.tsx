import MainLayout from "@/components/layouts/MainLayout";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
