export async function GET() {
  return Response.json([
    {
      id: 101,
      studentId: "2110258",
      issue: "Missed 3 consecutive tutoring sessions",
      severity: "High",
      status: "pending"
    },
    {
      id: 102,
      studentId: "2001221",
      issue: "Tutor-student conflict reported",
      severity: "Medium",
      status: "in_review"
    }
  ]);
}
