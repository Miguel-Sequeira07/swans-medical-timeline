import { Timeline } from "@/components/timeline/Timeline";
import { mockCase } from "@/lib/mock-case";

export default function Home() {
  return (
    <main className="flex-1 bg-background">
      <Timeline case={mockCase} />
    </main>
  );
}
