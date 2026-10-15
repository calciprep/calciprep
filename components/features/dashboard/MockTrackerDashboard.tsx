"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PlatformType,
  ExamCategory,
  MockMode,
  SectionKey,
  MockTestRecord,
  UserMockGoal,
} from "@/lib/mockTrackerTypes";
import {
  getLocalMocks,
  saveLocalMocks,
  getLocalGoal,
  saveLocalGoal,
  fetchUserMocksFromCloud,
  saveMockToCloud,
  deleteMockFromCloud,
  fetchUserGoalFromCloud,
  saveUserGoalToCloud,
} from "@/services/mockTrackerService";
import {
  TrendingUp,
  Plus,
  Trash2,
  Award,
  Target,
  AlertTriangle,
  Filter,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Cloud,
  CloudOff,
  Sparkles,
  Activity,
  ShieldCheck,
  Sun,
  Moon,
  Calculator,
  Brain,
  Globe,
  Zap,
} from "lucide-react";

const PLATFORMS: PlatformType[] = [
  "Testbook",
  "Oliveboard",
  "Parmar SSC",
  "RBE",
  "PracticeMock",
  "SuperMocks",
  "Other",
];

const SECTION_META: Record<
  SectionKey,
  {
    label: string;
    shortLabel: string;
    accent: string;
    barClass: string;
    badgeDark: string;
    badgeLight: string;
  }
> = {
  quant: {
    label: "Quant / Maths",
    shortLabel: "Quant",
    accent: "indigo",
    barClass: "bg-gradient-to-r from-indigo-600 to-blue-500",
    badgeDark: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    badgeLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  reasoning: {
    label: "Reasoning",
    shortLabel: "Reasoning",
    accent: "amber",
    barClass: "bg-gradient-to-r from-amber-500 to-orange-500",
    badgeDark: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    badgeLight: "bg-amber-50 text-amber-700 border-amber-200",
  },
  english: {
    label: "English",
    shortLabel: "English",
    accent: "emerald",
    barClass: "bg-gradient-to-r from-emerald-600 to-teal-500",
    badgeDark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badgeLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  gk: {
    label: "GK / GS",
    shortLabel: "GK/GS",
    accent: "purple",
    barClass: "bg-gradient-to-r from-purple-600 to-pink-500",
    badgeDark: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    badgeLight: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const EXAM_PRESETS: Record<
  ExamCategory,
  {
    maxScore: number;
    defaultTarget: number;
    sectionalMax: Record<SectionKey, number>;
  }
> = {
  "SSC CGL Tier-1": {
    maxScore: 200,
    defaultTarget: 155,
    sectionalMax: { quant: 50, reasoning: 50, english: 50, gk: 50 },
  },
  "SSC CGL Tier-2": {
    maxScore: 390,
    defaultTarget: 325,
    sectionalMax: { quant: 90, reasoning: 90, english: 135, gk: 75 },
  },
  "SSC CPO": {
    maxScore: 200,
    defaultTarget: 150,
    sectionalMax: { quant: 50, reasoning: 50, english: 50, gk: 50 },
  },
  "SSC CHSL": {
    maxScore: 200,
    defaultTarget: 160,
    sectionalMax: { quant: 50, reasoning: 50, english: 50, gk: 50 },
  },
  "Delhi Police HCM": {
    maxScore: 100,
    defaultTarget: 78,
    sectionalMax: { quant: 20, reasoning: 25, english: 25, gk: 30 },
  },
  "IB ACIO": {
    maxScore: 100,
    defaultTarget: 72,
    sectionalMax: { quant: 20, reasoning: 20, english: 20, gk: 40 },
  },
};

const PLATFORM_STYLE: Record<
  PlatformType,
  { dark: string; light: string }
> = {
  Testbook: {
    dark: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    light: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  Oliveboard: {
    dark: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "Parmar SSC": {
    dark: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    light: "bg-amber-50 text-amber-700 border-amber-200",
  },
  RBE: {
    dark: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    light: "bg-purple-50 text-purple-700 border-purple-200",
  },
  PracticeMock: {
    dark: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    light: "bg-rose-50 text-rose-700 border-rose-200",
  },
  SuperMocks: {
    dark: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    light: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  Other: {
    dark: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    light: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

interface MockTrackerProps {
  fullPage?: boolean;
}

export default function MockTrackerDashboard({
  fullPage = false,
}: MockTrackerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, authLoading, openModal } = useAuth() as any;
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme State (Dark by default like SSC Daily Tracker)
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isDark = theme === "dark";

  const [mocks, setMocks] = useState<MockTestRecord[]>([]);
  const [goal, setGoal] = useState<UserMockGoal>({
    targetExam: "SSC CPO",
    targetScore: 150,
    targetPercentile: 90,
  });

  // UI Toggles & Filters
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedExam, setSelectedExam] = useState<string>("All");
  const [chartMetric, setChartMetric] = useState<"score" | "percentile">("score");

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [platform, setPlatform] = useState<PlatformType>("Testbook");
  const [exam, setExam] = useState<ExamCategory>("SSC CPO");
  const [mockMode, setMockMode] = useState<MockMode>("Full Mock");
  const [sectionalSubject, setSectionalSubject] = useState<SectionKey>("quant");
  const [maxScore, setMaxScore] = useState<number>(200);
  const [percentile, setPercentile] = useState<string>("");
  const [accuracy, setAccuracy] = useState<string>("");
  const [quant, setQuant] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [english, setEnglish] = useState<string>("");
  const [gk, setGk] = useState<string>("");
  const [weakTopics, setWeakTopics] = useState<string>("");

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("calciprep_mock_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("calciprep_mock_theme", next);
  };

  // Load Mocks from Firebase (if logged in) or LocalStorage (if guest)
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function loadData() {
      setIsSyncing(true);
      if (currentUser?.uid) {
        const [cloudMocks, cloudGoal] = await Promise.all([
          fetchUserMocksFromCloud(currentUser.uid),
          fetchUserGoalFromCloud(currentUser.uid),
        ]);
        if (!cancelled) {
          setMocks(cloudMocks);
          setGoal(cloudGoal);
        }
      } else {
        if (!cancelled) {
          setMocks(getLocalMocks());
          setGoal(getLocalGoal());
        }
      }
      if (!cancelled) {
        setIsSyncing(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  // Synchronize Max Score whenever Exam, MockMode, or SectionalSubject changes
  const updateMaxMarks = (
    targetExam: ExamCategory,
    mode: MockMode,
    secSubj: SectionKey
  ) => {
    if (mode === "Full Mock") {
      setMaxScore(EXAM_PRESETS[targetExam].maxScore);
    } else {
      setMaxScore(EXAM_PRESETS[targetExam].sectionalMax[secSubj]);
    }
  };

  const handleExamPresetChange = (newExam: ExamCategory) => {
    setExam(newExam);
    updateMaxMarks(newExam, mockMode, sectionalSubject);
  };

  const handleMockModeChange = (newMode: MockMode) => {
    setMockMode(newMode);
    updateMaxMarks(exam, newMode, sectionalSubject);
  };

  const handleSectionalSubjectChange = (newSubj: SectionKey) => {
    setSectionalSubject(newSubj);
    updateMaxMarks(exam, "Sectional Mock", newSubj);
  };

  // Auto-calculate Total Marks based on Full Mock vs Sectional Mock
  const calculatedTotal = useMemo(() => {
    if (mockMode === "Sectional Mock") {
      if (sectionalSubject === "quant") return Number((parseFloat(quant) || 0).toFixed(2));
      if (sectionalSubject === "reasoning") return Number((parseFloat(reasoning) || 0).toFixed(2));
      if (sectionalSubject === "english") return Number((parseFloat(english) || 0).toFixed(2));
      return Number((parseFloat(gk) || 0).toFixed(2));
    }
    const q = parseFloat(quant) || 0;
    const r = parseFloat(reasoning) || 0;
    const e = parseFloat(english) || 0;
    const g = parseFloat(gk) || 0;
    return Number((q + r + e + g).toFixed(2));
  }, [mockMode, sectionalSubject, quant, reasoning, english, gk]);

  // Add Mock Handler
  const handleAddMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const sectionsPayload =
      mockMode === "Full Mock"
        ? {
            quant: parseFloat(quant) || 0,
            reasoning: parseFloat(reasoning) || 0,
            english: parseFloat(english) || 0,
            gk: parseFloat(gk) || 0,
          }
        : {
            quant: sectionalSubject === "quant" ? parseFloat(quant) || 0 : 0,
            reasoning:
              sectionalSubject === "reasoning" ? parseFloat(reasoning) || 0 : 0,
            english:
              sectionalSubject === "english" ? parseFloat(english) || 0 : 0,
            gk: sectionalSubject === "gk" ? parseFloat(gk) || 0 : 0,
          };

    const newRecord: MockTestRecord = {
      id: `mock_${Date.now()}`,
      title: title.trim(),
      date,
      createdAt: Date.now(),
      platform,
      exam,
      mockMode,
      ...(mockMode === "Sectional Mock" ? { sectionalSubject } : {}),
      totalScore: calculatedTotal,
      maxScore: Number(maxScore) || 200,
      percentile: Math.min(100, Math.max(0, parseFloat(percentile) || 0)),
      accuracy: Math.min(100, Math.max(0, parseFloat(accuracy) || 0)),
      sections: sectionsPayload,
      weakTopics: weakTopics.trim(),
    };

    const updated = [...mocks, newRecord].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setMocks(updated);
    saveLocalMocks(updated);

    if (currentUser?.uid) {
      setIsSyncing(true);
      await saveMockToCloud(currentUser.uid, newRecord);
      setIsSyncing(false);
    }

    setTitle("");
    setPercentile("");
    setAccuracy("");
    setQuant("");
    setReasoning("");
    setEnglish("");
    setGk("");
    setWeakTopics("");
    setShowAddForm(false);
  };

  const handleDeleteMock = async (mockId: string) => {
    const updated = mocks.filter((m) => m.id !== mockId);
    setMocks(updated);
    saveLocalMocks(updated);

    if (currentUser?.uid) {
      setIsSyncing(true);
      await deleteMockFromCloud(currentUser.uid, mockId);
      setIsSyncing(false);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalGoal(goal);
    if (currentUser?.uid) {
      setIsSyncing(true);
      await saveUserGoalToCloud(currentUser.uid, goal);
      setIsSyncing(false);
    }
    setShowGoalModal(false);
  };

  // Filtered Mocks
  const filteredMocks = useMemo(() => {
    return mocks
      .filter((m) => {
        const matchPlatform =
          selectedPlatform === "All" || m.platform === selectedPlatform;
        const matchExam = selectedExam === "All" || m.exam === selectedExam;
        return matchPlatform && matchExam;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [mocks, selectedPlatform, selectedExam]);

  // Smart Analytics Engine (Handles both Full & Sectional Mocks accurately)
  const analytics = useMemo(() => {
    if (filteredMocks.length === 0) {
      return {
        avgScorePct: 0,
        avgFullRawScore: 0,
        avgPercentile: 0,
        bestScore: 0,
        bestMax: 200,
        netImprovement: 0,
        weakestSection: "N/A",
        consistencyLabel: "Need 3+ Mocks",
        sectionAverages: {
          quant: 0,
          reasoning: 0,
          english: 0,
          gk: 0,
        } as Record<SectionKey, number>,
        sectionVelocity: {
          quant: 0,
          reasoning: 0,
          english: 0,
          gk: 0,
        } as Record<SectionKey, number>,
        platformBreakdown: [] as {
          platform: string;
          count: number;
          avgScorePct: number;
          avgPercentile: number;
          avgAccuracy: number;
        }[],
      };
    }

    const count = filteredMocks.length;
    const totalPct = filteredMocks.reduce(
      (acc, m) => acc + (m.totalScore / m.maxScore) * 100,
      0
    );
    const avgScorePct = Number((totalPct / count).toFixed(1));

    // Average Raw Score for Full Mocks (or scaled to 200 if only sectionals exist)
    const fullMocksOnly = filteredMocks.filter(
      (m) => m.mockMode === "Full Mock"
    );
    const avgFullRawScore =
      fullMocksOnly.length > 0
        ? Number(
            (
              fullMocksOnly.reduce((acc, m) => acc + m.totalScore, 0) /
              fullMocksOnly.length
            ).toFixed(1)
          )
        : Number(((avgScorePct / 100) * 200).toFixed(1));

    const avgPercentile = Number(
      (
        filteredMocks.reduce((acc, m) => acc + m.percentile, 0) / count
      ).toFixed(1)
    );

    const bestMock = filteredMocks.reduce((prev, curr) =>
      curr.totalScore / curr.maxScore > prev.totalScore / prev.maxScore
        ? curr
        : prev
    );

    const firstPct =
      (filteredMocks[0].totalScore / filteredMocks[0].maxScore) * 100;
    const lastPct =
      (filteredMocks[count - 1].totalScore /
        filteredMocks[count - 1].maxScore) *
      100;
    const netImprovement = Number((lastPct - firstPct).toFixed(1));

    const recent5 = filteredMocks.slice(-5);
    const recentMean =
      recent5.reduce((acc, m) => acc + (m.totalScore / m.maxScore) * 100, 0) /
      recent5.length;
    const variance =
      recent5.reduce(
        (acc, m) =>
          acc + Math.pow((m.totalScore / m.maxScore) * 100 - recentMean, 2),
        0
      ) / recent5.length;
    const stdDev = Math.sqrt(variance);
    const consistencyLabel =
      count < 3
        ? "Log 3+ Mocks"
        : stdDev < 4.5
        ? `Locked In (±${stdDev.toFixed(1)}%)`
        : stdDev < 9
        ? `Stable (±${stdDev.toFixed(1)}%)`
        : `Volatile (±${stdDev.toFixed(1)}%)`;

    // Calculate accurate subject averages (only counting tests where that subject was attempted)
    const sectionKeys: SectionKey[] = ["quant", "reasoning", "english", "gk"];
    const sectionAverages: Record<SectionKey, number> = {
      quant: 0,
      reasoning: 0,
      english: 0,
      gk: 0,
    };
    const sectionVelocity: Record<SectionKey, number> = {
      quant: 0,
      reasoning: 0,
      english: 0,
      gk: 0,
    };

    sectionKeys.forEach((key) => {
      const relevantMocks = filteredMocks.filter(
        (m) =>
          m.mockMode === "Full Mock" ||
          (m.mockMode === "Sectional Mock" && m.sectionalSubject === key)
      );
      if (relevantMocks.length > 0) {
        const sum = relevantMocks.reduce((acc, m) => acc + m.sections[key], 0);
        sectionAverages[key] = Number((sum / relevantMocks.length).toFixed(1));

        const firstB = relevantMocks.slice(0, Math.min(3, relevantMocks.length));
        const lastB = relevantMocks.slice(-Math.min(3, relevantMocks.length));
        const avgFirst =
          firstB.reduce((a, b) => a + b.sections[key], 0) / firstB.length;
        const avgLast =
          lastB.reduce((a, b) => a + b.sections[key], 0) / lastB.length;
        sectionVelocity[key] = Number((avgLast - avgFirst).toFixed(1));
      }
    });

    const activeSectionEntries = sectionKeys
      .map((k) => ({ key: k, val: sectionAverages[k] }))
      .filter((item) => item.val > 0);

    const weakestSection =
      activeSectionEntries.length > 0
        ? SECTION_META[
            activeSectionEntries.sort((a, b) => a.val - b.val)[0].key
          ].shortLabel
        : "N/A";

    const platformMap: Record<
      string,
      {
        count: number;
        totalPctScore: number;
        totalPctile: number;
        totalAcc: number;
      }
    > = {};
    filteredMocks.forEach((m) => {
      if (!platformMap[m.platform]) {
        platformMap[m.platform] = {
          count: 0,
          totalPctScore: 0,
          totalPctile: 0,
          totalAcc: 0,
        };
      }
      platformMap[m.platform].count += 1;
      platformMap[m.platform].totalPctScore +=
        (m.totalScore / m.maxScore) * 100;
      platformMap[m.platform].totalPctile += m.percentile;
      platformMap[m.platform].totalAcc += m.accuracy;
    });

    const platformBreakdown = Object.entries(platformMap).map(
      ([plat, data]) => ({
        platform: plat,
        count: data.count,
        avgScorePct: Number((data.totalPctScore / data.count).toFixed(1)),
        avgPercentile: Number((data.totalPctile / data.count).toFixed(1)),
        avgAccuracy: Number((data.totalAcc / data.count).toFixed(1)),
      })
    );

    return {
      avgScorePct,
      avgFullRawScore,
      avgPercentile,
      bestScore: bestMock.totalScore,
      bestMax: bestMock.maxScore,
      netImprovement,
      weakestSection,
      consistencyLabel,
      sectionAverages,
      sectionVelocity,
      platformBreakdown,
    };
  }, [filteredMocks]);

  const gapToTarget = Number(
    (goal.targetScore - analytics.avgFullRawScore).toFixed(1)
  );

  // Theme Surface Classes (Matching SSC Daily Tracker.html)
  const wrapperClass = fullPage
    ? isDark
      ? "min-h-screen bg-[#0b111e] text-slate-100 pt-[80px] pb-16 transition-colors duration-200"
      : "min-h-screen bg-slate-50 text-slate-900 pt-[80px] pb-16 transition-colors duration-200"
    : isDark
    ? "bg-[#0b111e] text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 transition-colors duration-200"
    : "bg-slate-50 text-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 transition-colors duration-200";

  const cardClass = isDark
    ? "bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-md"
    : "bg-white border border-slate-200/80 rounded-2xl shadow-sm";

  const subCardClass = isDark
    ? "bg-[#151e2e] border border-slate-800 rounded-xl"
    : "bg-slate-50/90 border border-slate-200/70 rounded-xl";

  const inputClass = isDark
    ? "w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    : "w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={wrapperClass}>
      <div
        className={
          fullPage
            ? "max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6"
            : "space-y-6"
        }
      >
        {/* TOP FUTURISTIC COMMAND HEADER */}
        <header
          className={`${cardClass} p-5 sm:p-6 relative overflow-hidden`}
        >
          {/* Ambient Futuristic Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                    CALCIPREP{" "}
                    <span className="text-indigo-500 font-mono">
                      MOCK•TELEMETRY
                    </span>
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isDark
                        ? "bg-indigo-950/80 text-indigo-300 border-indigo-800/60"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    CGL • CPO • CHSL • IB ACIO
                  </span>

                  {/* Cloud Sync Badge */}
                  {currentUser ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isDark
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      <Cloud className="w-3 h-3" />
                      {isSyncing ? "Syncing..." : "Cloud Active"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal && openModal(true)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition ${
                        isDark
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <CloudOff className="w-3 h-3" />
                      Guest Mode (Sign in to Sync)
                    </button>
                  )}
                </div>
                <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>
                  Multi-Platform Score, Percentile & Sectional Velocity Engine
                  across Testbook, Oliveboard, Parmar SSC & RBE
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowGoalModal(!showGoalModal)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80"
                }`}
              >
                <Target className="w-4 h-4 text-indigo-500" />
                <span>
                  Target:{" "}
                  <strong className="font-mono">{goal.targetScore}</strong> (
                  {goal.targetExam})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? "Close Logger" : "Log Mock Result"}</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                title="Toggle Futuristic Dark / Light Mode"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80"
                }`}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* TARGET GOAL DRAWER */}
        {showGoalModal && (
          <form
            onSubmit={handleSaveGoal}
            className={`${cardClass} p-5 sm:p-6 space-y-4 border-indigo-500/40`}
          >
            <div className="flex items-center justify-between border-b border-slate-500/20 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Configure Target Exam & Cutoff
                Benchmark
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Target Exam
                </label>
                <select
                  value={goal.targetExam}
                  onChange={(e) => {
                    const ex = e.target.value as ExamCategory;
                    setGoal({
                      ...goal,
                      targetExam: ex,
                      targetScore: EXAM_PRESETS[ex].defaultTarget,
                    });
                  }}
                  className={inputClass}
                >
                  {Object.keys(EXAM_PRESETS).map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Target Full-Mock Score
                </label>
                <input
                  type="number"
                  value={goal.targetScore}
                  onChange={(e) =>
                    setGoal({ ...goal, targetScore: Number(e.target.value) })
                  }
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Target Percentile (%)
                </label>
                <input
                  type="number"
                  max="100"
                  value={goal.targetPercentile}
                  onChange={(e) =>
                    setGoal({
                      ...goal,
                      targetPercentile: Number(e.target.value),
                    })
                  }
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer"
              >
                Save Benchmark
              </button>
            </div>
          </form>
        )}

        {/* LOG MOCK TEST FORM (WITH DYNAMIC FULL vs SECTIONAL SWITCHING) */}
        {showAddForm && (
          <form
            onSubmit={handleAddMock}
            className={`${cardClass} p-5 sm:p-6 space-y-6 ring-1 ring-indigo-500/30`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-500/20 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Log Mock Test Telemetry
              </h2>
              <span className={`text-xs font-mono ${mutedText}`}>
                {mockMode === "Full Mock"
                  ? `Full Paper Mode • Max ${maxScore} Marks`
                  : `Single-Subject Sectional Mode • ${SECTION_META[sectionalSubject].label} (Max ${maxScore} Marks)`}
              </span>
            </div>

            {/* Row 1: Mock Name, Platform, Exam Category */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Mock Test Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    mockMode === "Full Mock"
                      ? "e.g., Oliveboard All India Live Mock #12"
                      : `e.g., Testbook ${SECTION_META[sectionalSubject].shortLabel} Sectional Test #4`
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className={inputClass}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Exam Pattern
                </label>
                <select
                  value={exam}
                  onChange={(e) =>
                    handleExamPresetChange(e.target.value as ExamCategory)
                  }
                  className={inputClass}
                >
                  {Object.keys(EXAM_PRESETS).map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: DYNAMIC FULL MOCK vs SECTIONAL MOCK PANEL */}
            <div className={`${subCardClass} p-4 sm:p-5 space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    {mockMode === "Full Mock"
                      ? "Full Mock Section-Wise Breakdown (Auto-Sums Total)"
                      : "Sectional Mock Subject & Score"}
                  </span>
                  <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                    {mockMode === "Full Mock"
                      ? "Enter marks scored in all 4 sections below."
                      : "Choose which subject you attempted; Max Marks automatically adjusts to that section."}
                  </p>
                </div>

                {/* Mode Switcher Pills */}
                <div
                  className={`inline-flex p-1 rounded-xl border ${
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-slate-200/70 border-slate-300"
                  }`}
                >
                  {(["Full Mock", "Sectional Mock"] as MockMode[]).map(
                    (mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => handleMockModeChange(mode)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          mockMode === mode
                            ? "bg-indigo-600 text-white shadow-sm"
                            : isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  )}
                </div>
              </div>

              {mockMode === "Full Mock" ? (
                /* ALL 4 SUBJECTS FOR FULL MOCK */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-indigo-500" />{" "}
                        Quant / Maths
                      </span>
                      <span className={`font-mono text-[11px] ${mutedText}`}>
                        /{EXAM_PRESETS[exam].sectionalMax.quant}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="0.0"
                      value={quant}
                      onChange={(e) => setQuant(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-amber-500" />{" "}
                        Reasoning
                      </span>
                      <span className={`font-mono text-[11px] ${mutedText}`}>
                        /{EXAM_PRESETS[exam].sectionalMax.reasoning}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="0.0"
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        English
                      </span>
                      <span className={`font-mono text-[11px] ${mutedText}`}>
                        /{EXAM_PRESETS[exam].sectionalMax.english}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="0.0"
                      value={english}
                      onChange={(e) => setEnglish(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-500" /> GK / GS
                      </span>
                      <span className={`font-mono text-[11px] ${mutedText}`}>
                        /{EXAM_PRESETS[exam].sectionalMax.gk}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      placeholder="0.0"
                      value={gk}
                      onChange={(e) => setGk(e.target.value)}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>
              ) : (
                /* SINGLE SUBJECT SELECTOR + SINGLE SCORE INPUT FOR SECTIONAL MOCK */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1 items-end">
                  <div className="md:col-span-8">
                    <label
                      className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${mutedText}`}
                    >
                      1. Select Sectional Subject Attempted
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(SECTION_META) as SectionKey[]).map(
                        (secKey) => {
                          const active = sectionalSubject === secKey;
                          const secMax =
                            EXAM_PRESETS[exam].sectionalMax[secKey];
                          return (
                            <button
                              type="button"
                              key={secKey}
                              onClick={() =>
                                handleSectionalSubjectChange(secKey)
                              }
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                active
                                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 ring-1 ring-indigo-500"
                                  : isDark
                                  ? "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <div className="text-xs font-bold">
                                {SECTION_META[secKey].label}
                              </div>
                              <div
                                className={`text-[10px] font-mono mt-0.5 ${
                                  active ? "text-indigo-300" : mutedText
                                }`}
                              >
                                Max: {secMax} Marks
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <label className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span>
                        2. {SECTION_META[sectionalSubject].label} Score *
                      </span>
                      <span className="font-mono text-indigo-400">
                        Out of {maxScore}
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      required
                      placeholder={`Enter marks out of ${maxScore}`}
                      value={
                        sectionalSubject === "quant"
                          ? quant
                          : sectionalSubject === "reasoning"
                          ? reasoning
                          : sectionalSubject === "english"
                          ? english
                          : gk
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (sectionalSubject === "quant") setQuant(val);
                        else if (sectionalSubject === "reasoning")
                          setReasoning(val);
                        else if (sectionalSubject === "english")
                          setEnglish(val);
                        else setGk(val);
                      }}
                      className={`${inputClass} font-mono text-base`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Row 3: Global Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  {mockMode === "Full Mock"
                    ? "Total Score"
                    : "Sectional Score"}
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 border border-indigo-500/40 font-mono font-extrabold text-base text-indigo-400 flex items-center justify-between">
                  <span>{calculatedTotal}</span>
                  <span className="text-xs opacity-75">/ {maxScore}</span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Max Marks
                </label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Percentile (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max="100"
                  placeholder="e.g. 92.4"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Accuracy (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  placeholder="e.g. 86.5"
                  value={accuracy}
                  onChange={(e) => setAccuracy(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
                >
                  Attempt Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${mutedText}`}
              >
                Error Log / Weak Topics to Revise
              </label>
              <input
                type="text"
                placeholder="e.g., Mensuration prism formula, Article 32 writs, Cloze test vocab"
                value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer transition"
              >
                {currentUser ? "Save to Cloud Telemetry" : "Save Mock Entry"}
              </button>
            </div>
          </form>
        )}

        {/* FILTER BAR */}
        <div
          className={`${cardClass} p-4 flex flex-wrap items-center justify-between gap-4`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mr-2 ${mutedText}`}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-500" /> Platform:
            </span>
            {["All", ...PLATFORMS].map((p) => {
              const active = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                      : isDark
                      ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/70"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}
            >
              Exam:
            </span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-800"
              }`}
            >
              <option value="All">All Exams</option>
              {Object.keys(EXAM_PRESETS).map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 FUTURISTIC KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Net Trajectory */}
          <div
            className={`${cardClass} p-5 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Net Score Velocity
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                {analytics.netImprovement > 0
                  ? `+${analytics.netImprovement}%`
                  : `${analytics.netImprovement}%`}
              </div>
              <p className={`text-xs ${mutedText}`}>
                Avg Score Rate:{" "}
                <strong className="font-mono">{analytics.avgScorePct}%</strong>{" "}
                ({filteredMocks.length} tests)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 2: Percentile Standing */}
          <div
            className={`${cardClass} p-5 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Mean Percentile
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                {analytics.avgPercentile}%ile
              </div>
              <p className={`text-xs ${mutedText}`}>
                Target Benchmark:{" "}
                <strong className="font-mono">{goal.targetPercentile}%+</strong>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 3: Target Cutoff Gap */}
          <div
            className={`${cardClass} p-5 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Target Cutoff Gap
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                {filteredMocks.length === 0
                  ? "--"
                  : gapToTarget <= 0
                  ? "Cleared! 🏆"
                  : `-${gapToTarget}m`}
              </div>
              <p className={`text-xs ${mutedText}`}>
                Full Avg:{" "}
                <strong className="font-mono">
                  {analytics.avgFullRawScore}
                </strong>{" "}
                vs Goal{" "}
                <strong className="font-mono">{goal.targetScore}</strong>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 4: Weakest Link & Stability */}
          <div
            className={`${cardClass} p-5 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Priority Bottleneck
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                {analytics.weakestSection}
              </div>
              <p className={`text-xs ${mutedText}`}>
                Stability: <strong>{analytics.consistencyLabel}</strong>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* MAIN BENTO GRID: TRAJECTORY GRAPH + SECTIONAL STANDING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Glowing SVG Chart (8 Cols) */}
          <div className={`lg:col-span-8 ${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Performance Trajectory Curve
                </h2>
                <p className={`text-xs mt-0.5 ${mutedText}`}>
                  Switch to Percentile mode when comparing tough Oliveboard Live
                  Mocks against Testbook PYQs.
                </p>
              </div>

              <div
                className={`inline-flex p-1 rounded-xl border ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                <button
                  onClick={() => setChartMetric("score")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    chartMetric === "score"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : mutedText
                  }`}
                >
                  Score %
                </button>
                <button
                  onClick={() => setChartMetric("percentile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    chartMetric === "percentile"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : mutedText
                  }`}
                >
                  Percentile
                </button>
              </div>
            </div>

            {filteredMocks.length < 2 ? (
              <div
                className={`h-60 flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center ${
                  isDark
                    ? "border-slate-800 bg-slate-950/40 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <BarChart3 className="w-8 h-8 text-indigo-500/60 mb-2" />
                <p className="text-sm font-semibold">
                  Log at least 2 mocks in this view to render your telemetry
                  curve.
                </p>
              </div>
            ) : (
              <div className="relative h-64 w-full pt-4">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 600 200"
                >
                  <defs>
                    <linearGradient
                      id="lineGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {[25, 50, 75, 100].map((val) => {
                    const y = 175 - (val / 100) * 150;
                    return (
                      <g key={val}>
                        <line
                          x1="40"
                          y1={y}
                          x2="580"
                          y2={y}
                          stroke={isDark ? "#1e293b" : "#e2e8f0"}
                          strokeWidth="1.5"
                          strokeDasharray="5 5"
                        />
                        <text
                          x="6"
                          y={y + 4}
                          className="text-[10px] font-mono fill-slate-500"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  <polyline
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={filteredMocks
                      .map((m, idx) => {
                        const val =
                          chartMetric === "score"
                            ? (m.totalScore / m.maxScore) * 100
                            : m.percentile;
                        const x =
                          45 + (idx / (filteredMocks.length - 1)) * 525;
                        const y =
                          175 -
                          (Math.min(100, Math.max(0, val)) / 100) * 150;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {filteredMocks.map((m, idx) => {
                    const val =
                      chartMetric === "score"
                        ? Number(
                            ((m.totalScore / m.maxScore) * 100).toFixed(1)
                          )
                        : m.percentile;
                    const x = 45 + (idx / (filteredMocks.length - 1)) * 525;
                    const y =
                      175 - (Math.min(100, Math.max(0, val)) / 100) * 150;

                    return (
                      <g key={m.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          className={
                            isDark
                              ? "fill-slate-950 stroke-indigo-400 stroke-[3px]"
                              : "fill-white stroke-indigo-600 stroke-[3px]"
                          }
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${
                            isDark ? "fill-slate-200" : "fill-slate-800"
                          }`}
                        >
                          {chartMetric === "score"
                            ? `${m.totalScore}/${m.maxScore}`
                            : `${val}%`}
                        </text>
                        <text
                          x={x}
                          y={195}
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-slate-500"
                        >
                          {m.platform.slice(0, 6)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Sectional Standing & Velocity (4 Cols) */}
          <div
            className={`lg:col-span-4 ${cardClass} p-5 sm:p-6 flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  Sectional Standing & Velocity
                </h2>
                <p className={`text-xs mt-0.5 ${mutedText}`}>
                  First-3 vs Last-3 mock delta per subject
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {(Object.keys(SECTION_META) as SectionKey[]).map((secKey) => {
                  const meta = SECTION_META[secKey];
                  const avgVal = analytics.sectionAverages[secKey];
                  const vel = analytics.sectionVelocity[secKey];
                  const pct = Math.min(100, Math.round((avgVal / 50) * 100));

                  return (
                    <div key={secKey} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{meta.label}</span>
                        <span className="font-mono text-xs">
                          <strong>{avgVal}</strong> avg{" "}
                          <span
                            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              vel >= 0
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {vel >= 0 ? `+${vel}` : vel}
                          </span>
                        </span>
                      </div>
                      <div
                        className={`w-full h-2 rounded-full overflow-hidden ${
                          isDark ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      >
                        <div
                          className={`h-full ${meta.barClass} transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${subCardClass} p-3.5 mt-6 text-xs space-y-1`}>
              <span className="font-bold text-indigo-400 uppercase tracking-wider block">
                ⚡ Telemetry Recommendation
              </span>
              <p className={mutedText}>
                Focus next drill session on{" "}
                <strong className={isDark ? "text-white" : "text-slate-900"}>
                  {analytics.weakestSection}
                </strong>
                . Log sectional mocks after revising your error vault below.
              </p>
            </div>
          </div>
        </div>

        {/* PLATFORM COMPARISON MATRIX */}
        {analytics.platformBreakdown.length > 0 && (
          <div className={`${cardClass} p-5 sm:p-6`}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Platform-by-Platform Calibration Matrix
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.platformBreakdown.map((item) => {
                const pStyle =
                  PLATFORM_STYLE[item.platform as PlatformType] ||
                  PLATFORM_STYLE.Other;
                return (
                  <div key={item.platform} className={`${subCardClass} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                          isDark ? pStyle.dark : pStyle.light
                        }`}
                      >
                        {item.platform}
                      </span>
                      <span className={`text-xs font-mono ${mutedText}`}>
                        {item.count} {item.count === 1 ? "test" : "tests"}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono">
                      {item.avgScorePct}%{" "}
                      <span className={`text-xs font-normal ${mutedText}`}>
                        avg score
                      </span>
                    </div>
                    <div
                      className={`text-xs font-mono mt-2 pt-2 border-t flex justify-between ${
                        isDark
                          ? "border-slate-800 text-slate-400"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>Pctile: {item.avgPercentile}%</span>
                      <span>Acc: {item.avgAccuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOGGED MOCK HISTORY & ERROR VAULT TABLE */}
        <div className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Logged Mocks & Mistake Vault ({filteredMocks.length})
            </h2>
          </div>

          {filteredMocks.length === 0 ? (
            <div className={`text-center py-10 text-sm ${mutedText}`}>
              No mock tests logged yet. Click{" "}
              <strong>&quot;Log Mock Result&quot;</strong> above to record your
              first Full or Sectional test!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark
                        ? "border-slate-800 text-slate-400 bg-slate-950/50"
                        : "border-slate-200 text-slate-500 bg-slate-50"
                    }`}
                  >
                    <th className="py-3 px-3 rounded-tl-xl">Mock & Date</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Percentile</th>
                    <th className="py-3 px-3">Breakdown</th>
                    <th className="py-3 px-3">Mistake Vault / Weak Topics</th>
                    <th className="py-3 px-3 text-center rounded-tr-xl">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-slate-800/80" : "divide-slate-200/70"
                  }`}
                >
                  {[...filteredMocks].reverse().map((m) => {
                    const pStyle =
                      PLATFORM_STYLE[m.platform] || PLATFORM_STYLE.Other;
                    return (
                      <tr
                        key={m.id}
                        className={`transition ${
                          isDark
                            ? "hover:bg-slate-800/40"
                            : "hover:bg-slate-50/90"
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="font-bold">{m.title}</div>
                          <div
                            className={`text-[11px] font-mono flex flex-wrap items-center gap-1.5 mt-0.5 ${mutedText}`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{m.date}</span>
                            <span>•</span>
                            <span>{m.exam}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold border ${
                                m.mockMode === "Sectional Mock"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                              }`}
                            >
                              {m.mockMode}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              isDark ? pStyle.dark : pStyle.light
                            }`}
                          >
                            {m.platform}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          <span className="text-sm font-extrabold">
                            {m.totalScore}
                          </span>
                          <span className={`text-xs ${mutedText}`}>
                            /{m.maxScore}
                          </span>
                          <div className={`text-[11px] ${mutedText}`}>
                            Acc: {m.accuracy}%
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              m.percentile >= 90
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : m.percentile >= 80
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {m.percentile}%ile
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-xs">
                          {m.mockMode === "Sectional Mock" &&
                          m.sectionalSubject ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-sans font-semibold ${
                                isDark
                                  ? SECTION_META[m.sectionalSubject].badgeDark
                                  : SECTION_META[m.sectionalSubject].badgeLight
                              }`}
                            >
                              {SECTION_META[m.sectionalSubject].shortLabel}:{" "}
                              <strong className="font-mono">
                                {m.totalScore}/{m.maxScore}
                              </strong>
                            </span>
                          ) : (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                              <span>Q: {m.sections.quant}</span>
                              <span>R: {m.sections.reasoning}</span>
                              <span>E: {m.sections.english}</span>
                              <span>GK: {m.sections.gk}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 max-w-xs">
                          {m.weakTopics ? (
                            <span
                              className={`text-xs ${
                                isDark ? "text-rose-300" : "text-rose-700"
                              }`}
                            >
                              {m.weakTopics}
                            </span>
                          ) : (
                            <span className={mutedText}>—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteMock(m.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Mock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}