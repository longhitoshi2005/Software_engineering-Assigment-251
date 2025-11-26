export async function GET() {
  const data = [
    {
      id: 1,
      studentId: "2012345",
      studentName: "Nguyen Van A",
      course: "EE1012",
      status: "pending",
      tutor: "Tran Thi B",
    },
    {
      id: 2,
      studentId: "2110258",
      studentName: "Le Minh K",
      course: "CE1005",
      status: "pending",
      tutor: "Pham Van C",
    }
  ];

  return Response.json(data);
}
