import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AcademicStructure from "@/models/academicStructureModel";

export async function GET() {
  try {
    await connectDB();
    const count = await AcademicStructure.countDocuments();
    if (count > 0) {
      return NextResponse.json({ success: false, message: "Structure already seeded" }, { status: 400 });
    }

    const initialData = [
      {
        wingName: "Pre-Primary",
        classes: [
          { className: "Nursery", sections: ["A", "B", "C", "D"] },
          { className: "L.K.G", sections: ["A", "B", "C", "D"] },
          { className: "U.K.G", sections: ["A", "B", "C", "D"] },
        ],
      },
      {
        wingName: "Primary",
        classes: [
          { className: "Class 1", sections: ["A", "B", "C", "D"] },
          { className: "Class 2", sections: ["A", "B", "C", "D"] },
          { className: "Class 3", sections: ["A", "B", "C", "D"] },
          { className: "Class 4", sections: ["A", "B", "C", "D"] },
          { className: "Class 5", sections: ["A", "B", "C", "D"] },
        ],
      },
      {
        wingName: "Junior",
        classes: [
          { className: "Class 6", sections: ["A", "B", "C", "D"] },
          { className: "Class 7", sections: ["A", "B", "C", "D"] },
          { className: "Class 8", sections: ["A", "B", "C", "D"] },
        ],
      },
      {
        wingName: "Secondary",
        classes: [
          { className: "Class 9", sections: ["A", "B", "C", "D"] },
          { className: "Class 10", sections: ["A", "B", "C", "D"] },
        ],
      },
      {
        wingName: "Senior Secondary",
        classes: [
          { className: "Class 11", sections: ["A", "B", "C", "D"] },
          { className: "Class 12", sections: ["A", "B", "C", "D"] },
        ],
      },
    ];

    await AcademicStructure.insertMany(initialData);
    return NextResponse.json({ success: true, message: "Initial structure seeded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error seeding structure:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
