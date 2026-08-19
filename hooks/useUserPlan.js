import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useUserPlan() {
  const [plan, setPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPlan("free");
        setLoadingPlan(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user plan:", error);
        setLoadingPlan(false);
        return;
      }

      setPlan(data?.plan || "free");
      setLoadingPlan(false);
    };

    fetchPlan();
  }, []);

  return {
    plan,
    isPremium: plan === "premium",
    loadingPlan,
  };
}