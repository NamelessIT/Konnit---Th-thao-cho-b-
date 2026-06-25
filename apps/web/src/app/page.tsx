import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold text-primary">Konnit</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/admin" />} nativeButton={false}>Admin CMS</Button>
        <Button variant="outline" render={<Link href="/legacy/index.html" />} nativeButton={false}>
          Web tĩnh
        </Button>
      </div>
    </div>
  );
}
