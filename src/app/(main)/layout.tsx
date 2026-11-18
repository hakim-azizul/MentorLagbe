import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

/**
 * পাবলিক ব্রাউজিং লেয়াউট — `/tuitions` ইত্যাদি রুট।
 * `(root)`-এর মতোই Navbar + Footer, ড্যাশবোর্ড শেল ছাড়া।
 */
export default function MainLayout({
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
