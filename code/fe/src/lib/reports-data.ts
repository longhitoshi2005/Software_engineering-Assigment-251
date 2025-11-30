// lib/reports-data.ts

export const departmentalData = {
  term: "2025-1",
  attendance: 0.86,
  activeTutors: 24,
  totalSessions: 312,
  performanceIndex: 0.78,
};

export const participationData = {
  term: "2025-1",
  totalStudents: 520,
  participating: 188,
  byCourse: [
    { course: "CO1001", rate: 0.44 },
    { course: "CO2003", rate: 0.39 },
    { course: "CO3001", rate: 0.25 },
  ],
};

export const workloadData = {
  term: "2025-1",
  tutors: [
    { id: "T01", name: "Nguyen Van A", load: 0.75 },
    { id: "T02", name: "Tran Thi B", load: 0.55 },
    { id: "T03", name: "Le Dinh C", load: 0.92 },
  ],
};

export const performanceData = {
  term: "2025-1",
  improvements: 142,
  declines: 11,
  noChange: 39,
  averageDelta: 0.42,
};

export const feedbackTrendsData = {
  sentiment: { positive: 151, neutral: 41, negative: 17 },
  topics: [
    { tag: "pace", count: 12 },
    { tag: "examples", count: 9 },
    { tag: "scheduling", count: 7 },
  ],
};
