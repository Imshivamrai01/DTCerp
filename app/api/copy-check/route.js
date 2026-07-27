import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CopyCheck from "@/models/copyCheckModel";
import Student from "@/models/studentModel";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const dateData = searchParams.get("date");

    if (!dateData) {
      return NextResponse.json({ message: "Please provide the date!", success: false }, { status: 400 });
    }

    const copyCheck = await CopyCheck.find({ date: dateData });
    const count = copyCheck.length;

    return NextResponse.json({ data: copyCheck, count, success: true }, { status: 200 });
  } catch (error) {
    console.error("ListAllCopyCheck API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.user || !data.user._id || !data.user.role) {
      return NextResponse.json({ message: "User information missing!", success: false }, { status: 400 });
    }

    const userRoles = [data.user.role];
    if (data.user.secondaryRole) userRoles.push(data.user.secondaryRole);

    const isTeacher = userRoles.includes("Teacher");
    const isCoordinator = userRoles.includes("Junior Coordinator") || userRoles.includes("Senior Coordinator");

    const existingRecord = await CopyCheck.findOne({
      studentId: data.studentId,
      subject: data.subject,
      date: data.date,
      submitType: data.submitType,
    });

    if (existingRecord) {
      let message = "";
      let updated = false;

      if (isTeacher && !existingRecord.checkedByTeacher) {
        existingRecord.checkedByTeacher = `${data.user.name} (Teacher)`;
        existingRecord.isCopyChecked = true;
        existingRecord.teacherCheckedAt = new Date();
        message = "Copy checked by teacher successfully.";
        updated = true;
      }

      if (isCoordinator && !existingRecord.checkedByCoordinator) {
        const coordinatorRole = userRoles.find((role) => role === "Junior Coordinator" || role === "Senior Coordinator");
        existingRecord.checkedByCoordinator = `${data.user.name} (${coordinatorRole})`;
        existingRecord.isCoordinatorCopyChecked = true;
        existingRecord.coordinatorCheckedAt = new Date();
        message = updated ? "Copy checked by both teacher and coordinator." : "Copy checked by coordinator successfully.";
        updated = true;
      }

      if (!updated) {
        return NextResponse.json({ data: existingRecord, success: false, message: "Copy already checked for your role(s)." }, { status: 200 });
      }

      await existingRecord.save();
      return NextResponse.json({ data: existingRecord, success: true, message }, { status: 200 });
    }

    const newRecord = {
      studentId: data.studentId,
      date: data.date,
      subject: data.subject,
      submitType: data.submitType,
    };

    if (isTeacher) {
      newRecord.checkedByTeacher = `${data.user.name} (Teacher)`;
      newRecord.isCopyChecked = true;
      newRecord.teacherCheckedAt = new Date();
    }

    if (isCoordinator) {
      const coordinatorRole = userRoles.find((role) => role === "Junior Coordinator" || role === "Senior Coordinator");
      newRecord.checkedByCoordinator = `${data.user.name} (${coordinatorRole})`;
      newRecord.isCoordinatorCopyChecked = true;
      newRecord.coordinatorCheckedAt = new Date();
    }

    const copyCheck = await CopyCheck.create(newRecord);
    return NextResponse.json({ data: copyCheck, success: true, message: "Copy check recorded successfully." }, { status: 201 });
  } catch (error) {
    console.error("CreateCopyCheck API Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", success: false }, { status: 500 });
  }
}
