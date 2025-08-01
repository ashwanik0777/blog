import Navbar from "@/components/Navbar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
} 