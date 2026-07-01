import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="print:hidden"><PublicHeader /></div>
      <main className="flex-1 pt-[100px] print:pt-0">{children}</main>
      <div className="print:hidden"><PublicFooter /></div>
    </>
  );
}
