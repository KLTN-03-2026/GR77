import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}