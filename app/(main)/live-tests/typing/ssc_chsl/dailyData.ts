// ============================================================================
// DAILY PASSAGES DATA (40 Sets)
// ============================================================================
export const chslDailyPassages = [
  
];

// ============================================================================
// ADVANCED LIVE TEST SCHEDULER
// ============================================================================
export const liveTestConfig = {
  isPermanentlyPaused: false,
  pauseUntilDate: null as string | null, 
  skipDates: ['2026-10-02', '2026-11-12'],
  LIVE_TEST_LAUNCH_DATE: '2026-09-06' 
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTodayCHSLPassage = (dbSettings?: any, cloudPassages: any[] = []) => {
  // 1. Merge hardcoded passages FIRST, then append cloud passages ordered by upload date
  const allPassages = [...chslDailyPassages, ...cloudPassages];

  if (allPassages.length === 0) return null;

  const now = new Date();
  now.setHours(now.getHours() - 4);
  const dateString = now.toLocaleDateString('en-CA'); 

  const isActive = dbSettings && dbSettings.chslActive !== undefined 
    ? dbSettings.chslActive 
    : !liveTestConfig.isPermanentlyPaused;

  if (!isActive) return null;

  const pauseDate = dbSettings?.chslPauseDate !== undefined 
    ? dbSettings.chslPauseDate 
    : liveTestConfig.pauseUntilDate;

  if (pauseDate && dateString < pauseDate) return null;
  if (liveTestConfig.skipDates.includes(dateString)) return null;

  const launchDateToUse = dbSettings?.chslLaunchDate || liveTestConfig.LIVE_TEST_LAUNCH_DATE;
  const launchTime = new Date(launchDateToUse).getTime();
  const currentTime = new Date(dateString).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  
  const diffDays = Math.floor((currentTime - launchTime) / msPerDay);
  if (diffDays < 0) return null; 
  
  const index = Math.max(0, diffDays) % allPassages.length;
  return allPassages[index];
};