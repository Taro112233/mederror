/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SangkadSelectForm({ onSelect }: { onSelect: (s: string) => void }) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const value = (e.target as any).sangkad.value;
        onSelect(value);
      }}
    >
      <label>เลือกสังกัด</label>
      <select name="sangkad" required>
        <option value="">--เลือก--</option>
        <option value="A">A</option>
        <option value="B">B</option>
        {/* เพิ่ม option ตามต้องการ */}
      </select>
      <button type="submit">ถัดไป</button>
    </form>
  );
}
