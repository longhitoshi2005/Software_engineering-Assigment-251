export async function GET() {
  return Response.json([
    {
      title: "Training credit approved",
      detail: "Student #2110258 • EE1012",
      time: "2 hours ago"
    },
    {
      title: "Escalation created",
      detail: "Repeated absence reported by tutor",
      time: "7 hours ago"
    },
    {
      title: "Participation report imported",
      detail: "From Faculty of Computer Engineering",
      time: "1 day ago"
    }
  ]);
}
