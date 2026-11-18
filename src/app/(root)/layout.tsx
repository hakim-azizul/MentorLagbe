import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
// import Footer from "@/components/shared/Footer"; // যদি ফুটার থাকে

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}