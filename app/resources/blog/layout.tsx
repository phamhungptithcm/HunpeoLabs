import { BlogNoScriptReading } from "@/components/blog-loading";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blog-surface" lang="en">
      <BlogNoScriptReading />
      {children}
    </div>
  );
}
