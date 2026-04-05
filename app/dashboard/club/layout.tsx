import { ClubSubNav } from "./ClubSubNav";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ClubSubNav />
      {children}
    </div>
  );
}
