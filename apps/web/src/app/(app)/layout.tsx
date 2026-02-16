import { VisionLayout } from '@/components/vision/VisionLayout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VisionLayout>{children}</VisionLayout>;
}
