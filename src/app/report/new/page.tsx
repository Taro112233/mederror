"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";

const severityLevels = [
  { value: "A", label: "A - ไม่มีอันตราย" },
  { value: "B", label: "B - เกือบเกิดอันตราย" },
  { value: "C", label: "C - เกิดอันตรายเล็กน้อย" },
  { value: "D", label: "D - เกิดอันตรายรุนแรง" },
];
const errorTypes = [
  { value: "prescription", label: "การสั่งยา" },
  { value: "dispensing", label: "การจ่ายยา" },
  { value: "administration", label: "การให้ยา" },
];
const subErrorTypes = [
  { value: "dose", label: "ขนาดยา" },
  { value: "drug", label: "ชื่อยา" },
  { value: "route", label: "วิธีให้ยา" },
];

export default function ReportNewPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: any) => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    reset();
  };

  return (
    <div className="max-w-xl mx-auto w-full p-4 sm:p-6 bg-white rounded-lg shadow mt-4">
      <h1 className="text-xl font-bold mb-6 text-center">รายงาน Med error</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1 font-medium">วัน/เดือน/ปี ที่เกิดเหตุการณ์</label>
          <input type="date" {...register("eventDate", { required: true })} className="input input-bordered w-full" />
          {errors.eventDate && <span className="text-red-500 text-xs">กรุณาระบุวันที่</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">รายละเอียดเหตุการณ์</label>
          <textarea {...register("description", { required: true })} rows={4} className="input input-bordered w-full" />
          {errors.description && <span className="text-red-500 text-xs">กรุณากรอกรายละเอียด</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">ระดับความรุนแรง</label>
          <select {...register("severity", { required: true })} className="input input-bordered w-full">
            <option value="">-- เลือก --</option>
            {severityLevels.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.severity && <span className="text-red-500 text-xs">กรุณาเลือกระดับความรุนแรง</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">ชนิดความเคลื่อน</label>
          <select {...register("errorType", { required: true })} className="input input-bordered w-full">
            <option value="">-- เลือก --</option>
            {errorTypes.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          {errors.errorType && <span className="text-red-500 text-xs">กรุณาเลือกชนิดความเคลื่อน</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">ชนิดความเคลื่อนย่อย</label>
          <select {...register("subErrorType", { required: true })} className="input input-bordered w-full">
            <option value="">-- เลือก --</option>
            {subErrorTypes.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          {errors.subErrorType && <span className="text-red-500 text-xs">กรุณาเลือกชนิดย่อย</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">แนบรูปภาพ (ไม่บังคับ)</label>
          <input type="file" accept="image/*" {...register("image")} className="file-input w-full" />
        </div>
        <button type="submit" className="btn btn-primary w-full mt-2">ส่งรายงาน</button>
        {submitted && <div className="text-green-600 text-center mt-2">ส่งรายงานสำเร็จ!</div>}
      </form>
    </div>
  );
}
