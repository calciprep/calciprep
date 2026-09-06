// ============================================================================
// DAILY PASSAGES DATA (40 Sets)
// ============================================================================
export const cglDailyPassages = [
  { id: 'cgl-live-set-1', title: 'SSC CGL Live Test - 1', text: "[Paste CGL Passage 1 full text here...]", difficulty: 'Medium' },
  
];

// ============================================================================
// ADVANCED LIVE TEST SCHEDULER
// ============================================================================
export const liveTestConfig = {
  isPermanentlyPaused: false,
  pauseUntilDate: null as string | null, 
  skipDates: [
    '2026-10-02', 
    '2026-11-12', 
  ],
  LIVE_TEST_LAUNCH_DATE: '2026-09-06' 
};

// ADDED: Accept dbSettings to override the local logic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTodayCGLPassage = (dbSettings?: any) => {
  const now = new Date();
  
  // Subtract 4 hours so anything before 4:00 AM counts as "yesterday"
  now.setHours(now.getHours() - 4);
  const dateString = now.toLocaleDateString('en-CA'); 

  // --- AUTOMATION OVERRIDES (DATABASE PRECEDENCE) ---
  
  // 1. Is it currently active? (Check DB first, fallback to local config)
  const isActive = dbSettings && dbSettings.cglActive !== undefined 
    ? dbSettings.cglActive 
    : !liveTestConfig.isPermanentlyPaused;

  if (!isActive) return null;

  // 2. Pause Date Logic (Check DB first, fallback to local)
  const pauseDate = dbSettings?.cglPauseDate !== undefined 
    ? dbSettings.cglPauseDate 
    : liveTestConfig.pauseUntilDate;

  if (pauseDate && dateString < pauseDate) {
    return null;
  }

  // 3. Skip Dates (Holidays keep local priority)
  if (liveTestConfig.skipDates.includes(dateString)) return null;

  // --- PASSAGE SELECTION CALCULATION ---
  const launchDateToUse = dbSettings?.cglLaunchDate || liveTestConfig.LIVE_TEST_LAUNCH_DATE;
  
  const launchTime = new Date(launchDateToUse).getTime();
  const currentTime = new Date(dateString).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  
  const diffDays = Math.floor((currentTime - launchTime) / msPerDay);
  
  // If we haven't reached the launch date yet
  if (diffDays < 0) return null; 
  
  // Replace cglDailyPassages with whatever your actual array is named in this file!
  const index = Math.max(0, diffDays) % cglDailyPassages.length;
  return cglDailyPassages[index];
};