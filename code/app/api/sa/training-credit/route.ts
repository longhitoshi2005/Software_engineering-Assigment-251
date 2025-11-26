export async function GET() {
  return Response.json({
    semester: "Semester 1 - 2024",
    approvedCredits: 542,
    pendingReviews: 37,
    rejected: 12
  });
}
