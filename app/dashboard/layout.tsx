import { DashboardSidebar } from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <DashboardSidebar />
      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
          overflow: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
