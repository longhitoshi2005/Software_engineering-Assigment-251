// GET SA profile
export async function GET() {
  return Response.json({
    fullName: "Nguyễn Hoàng Tâm",
    staffId: "SA-23018",
    email: "tam.nh@hcmut.edu.vn",
    department: "Student Affairs Office",
    role: "Student Affairs Officer",
    scopes: [
      "participation.read",
      "participation.verify",
      "credits.issue",
      "eligibility.read",
      "reports.export"
    ],

    // Editable fields
    phone: "+84 907 442 122",
    personalEmail: "tam.sa@gmail.com",
    shortIntro: "Student Affairs officer responsible for tutoring participation, credits, and welfare reports.",
    twoFAEnabled: true,
    recoveryEmail: "sa.recovery@gmail.com",

    notifyParticipation: true,
    notifyCredits: true,
    notifyEscalations: true,

    timezone: "Asia/Ho_Chi_Minh",
    defaultLanding: "/sa/dashboard",

    showMaintenanceBanner: false
  });
}

// SAVE changes (mock)
export async function POST(req: Request) {
  const data = await req.json();

  return Response.json({
    success: true,
    updated: data
  });
}
