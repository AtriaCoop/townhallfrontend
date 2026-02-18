import { useEffect } from "react";
import { useRouter } from "next/router";

// HomePage now redirects to Dashboard since they've been combined
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/DashboardPage');
  }, [router]);

  return null;
}
