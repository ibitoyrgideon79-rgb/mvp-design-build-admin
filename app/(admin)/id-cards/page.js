"use client";

import { useEffect, useRef, useState } from "react";
import IdCardFront from "../../../components/IdCardFront";
import IdCardBack from "../../../components/IdCardBack";
import { resizeImageToDataUrl } from "../../../lib/resizeImage";

export default function IdCardsPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [side, setSide] = useState("front");
  const cardRef = useRef(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaff(data.staff ?? []);
    setLoading(false);
  }

  function selectStaff(member) {
    setSelectedId(member.id);
    setForm({ ...member });
    setStatus({ state: "idle", message: "" });
    setSide("front");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageToDataUrl(file);
    setForm((prev) => ({ ...prev, photoUrl: dataUrl }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ state: "idle", message: "" });

    const res = await fetch(`/api/staff/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setStatus({ state: "error", message: data.error ?? "Could not save changes." });
      return;
    }

    setForm(data.staff);
    setStaff((prev) => prev.map((s) => (s.id === data.staff.id ? data.staff : s)));
    setStatus({ state: "success", message: "Saved." });
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownload() {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `${form.badgeId}-id-card-${side}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="flex w-full flex-1">
      <div className="flex w-full max-w-sm flex-col border-r border-neutral-200 px-6 py-12 dark:border-neutral-800 print:hidden">
        <header>
          <h1 className="text-2xl font-semibold">ID Cards</h1>
          <p className="mt-1 text-sm text-neutral-500">Select a staff member to view, edit, print, or download their ID card.</p>
        </header>
        <ul className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800">
          {loading && <li className="py-3 text-sm text-neutral-500">Loading...</li>}
          {!loading && staff.length === 0 && (
            <li className="py-3 text-sm text-neutral-500">No staff onboarded yet.</li>
          )}
          {staff.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => selectStaff(s)}
                className={`w-full py-3 text-left text-sm transition-colors ${
                  selectedId === s.id ? "text-neutral-900 dark:text-white" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <p className="font-medium">{s.fullName}</p>
                <p className="text-neutral-500">{s.role} · {s.badgeId}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col px-6 py-12">
        {!form ? (
          <p className="text-sm text-neutral-500">Select a staff member on the left to see their details.</p>
        ) : (
          <div className="flex flex-col gap-8 print:items-center print:justify-center">
            <div className="print:hidden">
              <div className="mb-3 flex gap-1">
                <button
                  onClick={() => setSide("front")}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${side === "front" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setSide("back")}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${side === "back" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                >
                  Back
                </button>
              </div>
              <div ref={cardRef}>
                {side === "front" ? <IdCardFront staff={form} /> : <IdCardBack staff={form} />}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handlePrint}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Print {side}
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Download {side}
                </button>
              </div>
            </div>

            {/* Print-only copy of the currently selected side, unconstrained by the two-column layout */}
            <div className="hidden print:block">
              {side === "front" ? <IdCardFront staff={form} /> : <IdCardBack staff={form} />}
            </div>

            <form onSubmit={handleSave} className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2 print:hidden">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium">Photo (for ID card)</span>
                <div className="flex items-center gap-3">
                  {form.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
                </div>
              </label>

              <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} />
              <Field label="Role / Position" name="role" value={form.role} onChange={handleChange} required />
              <Field label="Department" name="department" value={form.department} onChange={handleChange} required />
              <Field label="Start date" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Employment type</span>
                <select
                  name="employmentType"
                  value={form.employmentType}
                  onChange={handleChange}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </label>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {status.state === "success" && <span className="text-sm text-green-600">{status.message}</span>}
                {status.state === "error" && <span className="text-sm text-red-600">{status.message}</span>}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
    </label>
  );
}
