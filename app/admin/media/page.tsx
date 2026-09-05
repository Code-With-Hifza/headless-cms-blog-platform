import { getMediaList } from "@/lib/services/media";
import { MediaManager } from "@/components/admin/media-manager";

export const revalidate = 0;

export default async function AdminMediaPage() {
  const mediaList = await getMediaList();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Assets Library</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Upload, manage, and optimize images and digital assets across your articles.
        </p>
      </div>

      <MediaManager initialMedia={mediaList} />
    </div>
  );
}
