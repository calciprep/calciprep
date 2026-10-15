import MockTrackerDashboard from "@/components/features/dashboard/MockTrackerDashboard";

export const metadata = {
  title: "Multi-Platform Mock Test Tracker | CalciPrep",
  description:
    "Track and analyze your SSC CGL, CPO, CHSL, Delhi Police HCM, and IB ACIO mock test scores across Testbook, Oliveboard, Parmar SSC, and RBE.",
};

export default function MockTrackerPage() {
  return <MockTrackerDashboard fullPage />;
}