"use client";

import { useEffect, useState } from "react";
import { resizeImageToDataUrl } from "../../../lib/resizeImage";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  startDate: "",
  employmentType: "Full-time",
  photoUrl: "",
};

export default function StaffOnboardPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [photoInputKey, setPhotoInputKey] = useState(0);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaff(data.staff ?? []);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "submitting", message: "" });

    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus({ state: "error", message: data.error ?? "Something went wrong" });
      return;
    }

    setForm(EMPTY_FORM);
    setPhotoInputKey((k) => k + 1);
    setStatus({ state: "success", message: `${data.staff.fullName} onboarded successfully.` });
    loadStaff();
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Staff Onboarding</h1>
        <p className="mt-1 text-sm text-neutral-500">
          MVP Design Build Admin — add a new staff member.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Photo (for ID card)</span>
          <div className="flex items-center gap-3 py-1">
            {form.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            )}
            <input
              key={photoInputKey}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="w-full text-sm text-neutral-500 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700 dark:file:bg-white dark:file:text-neutral-900"
            />
          </div>
        </label>

        <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
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
            disabled={status.state === "submitting"}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {status.state === "submitting" ? "Onboarding..." : "Onboard staff"}
          </button>
          {status.state === "success" && (
            <span className="text-sm text-green-600">{status.message}</span>
          )}
          {status.state === "error" && (
            <span className="text-sm text-red-600">{status.message}</span>
          )}
        </div>
      </form>

      <section className="max-w-4xl">
        <h2 className="text-lg font-semibold">Recently onboarded</h2>
        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
          {staff.length === 0 && (
            <li className="py-3 text-sm text-neutral-500">No staff onboarded yet.</li>
          )}
          {staff.map((s) => (
            <li key={s.id} className="py-3 text-sm">
              <p className="font-medium">{s.fullName} — {s.role}</p>
              <p className="text-neutral-500">
                {s.department} · {s.employmentType} · starts {s.startDate} · {s.email}
              </p>
            </li>
          ))}
        </ul>
      </section>
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
