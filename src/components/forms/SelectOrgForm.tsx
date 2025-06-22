import React, { useState } from "react";

interface SelectOrgFormProps {
  onSelect: (orgId: string) => void;
}

const mockOrganizations = [
  { id: "org1", name: "โรงพยาบาล A" },
  { id: "org2", name: "โรงพยาบาล B" },
  { id: "org3", name: "คลินิก C" },
];

export default function SelectOrgForm({ onSelect }: SelectOrgFormProps) {
  const [selected, setSelected] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) onSelect(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto mt-10">
      <label className="block text-sm font-medium mb-1">เลือกสังกัด</label>
      <select
        className="w-full border rounded px-3 py-2"
        value={selected}
        onChange={e => setSelected(e.target.value)}
        required
      >
        <option value="">-- กรุณาเลือก --</option>
        {mockOrganizations.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={!selected}
      >
        ดำเนินการต่อ
      </button>
    </form>
  );
}
