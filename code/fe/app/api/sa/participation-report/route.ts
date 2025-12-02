export async function GET() {
  return Response.json({
    data: [
      { class: "K23-CSE-01", total: 62, participated: 41 },
      { class: "K23-CSE-02", total: 58, participated: 35 }
    ],
    filters: {
      years: [2023, 2024, 2025],
      programs: ["CSE", "EE", "ME"],
    }
  });
}
