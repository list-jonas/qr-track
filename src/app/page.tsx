import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden rounded-lg bg-background p-20 md:shadow-xl">
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none">
          QR Track
        </h1>
        <p className="mt-4 max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Effortlessly create, manage, and track QR codes with powerful
          analytics.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
