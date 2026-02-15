import { useEffect } from "react";
import { useRouter } from "next/router";

// HomePage now redirects to Newsfeed since they've been combined
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/NewsfeedPage');
  }, [router]);

  return null;
}
