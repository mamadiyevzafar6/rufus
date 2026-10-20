import { Navbar } from '@/components/layout/navbar';

export default function ComponentsShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container pb-24 pt-28">{children}</main>
    </>
  );
}
