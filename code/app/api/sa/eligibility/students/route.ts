const mockStudents = [
  { id: "2252001", name: "Nguyen Van A", sessions: 7, feedback: 100 },
  { id: "2252003", name: "Le Minh K", sessions: 5, feedback: 80 },
  { id: "2252005", name: "Hoang Tuan L", sessions: 6, feedback: 83 },
  { id: "2252006", name: "Nguyen Anh T", sessions: 4, feedback: 75 },
  { id: "2252007", name: "Vo Thanh C", sessions: 8, feedback: 88 },
];

export async function GET() {
  return Response.json(mockStudents);
}
