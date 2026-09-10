"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ACTION_LABELS = {
  created: "Onboarded",
  updated: "Edited",
  enabled: "Enabled",
  disabled: "Disabled",
  marked_lost: "Marked ID lost",
  marked_found: "Marked ID found",
  deleted: "Deleted",
};

export default function ManageStaffPage() {
  const [staff, setStaff] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performedBy, setPerformedBy] = useState("");
  const [openMenu, setOpenMenu] = useState(null); // { id, top, right }
  const [busyId, setBusyId] = useState(null);
  const [clearingActivity, setClearingActivity] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPerformedBy(localStorage.getItem("mc_performed_by") || "");
    load();
  }, []);

  function handleNameChange(e) {
    setPerformedBy(e.target.value);
    localStorage.setItem("mc_performed_by", e.target.value);
  }

  async function load() {
    setLoading(true);
    const [staffRes, activityRes] = await Promise.all([
      fetch("/api/staff"),
      fetch("/api/activity"),
    ]);
    const staffData = await staffRes.json();
    const activityData = await activityRes.json();
    setStaff(staffData.staff ?? []);
    setActivity(activityData.activity ?? []);
    setLoading(false);
  }

  async function toggleStatus(member, patch) {
    setError("");
    setBusyId(member.id);
    setOpenMenu(null);
    const res = await fetch(`/api/staff/${member.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, performedBy: performedBy || undefined }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Could not update that staff member.");
      return;
    }
    load();
  }

  async function handleClearActivity() {
    if (!confirm("Clear the entire activity log? This can't be undone.")) return;
    setClearingActivity(true);
    const res = await fetch("/api/activity", { method: "DELETE" });
    setClearingActivity(false);
    if (!res.ok) {
      setError("Could not clear the activity log.");
      return;
    }
    setActivity([]);
  }

  async function handleDelete(member) {
    if (!performedBy.trim()) {
      setError('Enter "Your name" above before deleting a staff member.');
      return;
    }
    if (!confirm(`Delete ${member.fullName}? This can't be undone.`)) return;

    setError("");
    setBusyId(member.id);
    setOpenMenu(null);
    const res = await fetch(
      `/api/staff/${member.id}?performedBy=${encodeURIComponent(performedBy)}`,
      { method: "DELETE" }
    );
    setBusyId(null);
    if (!res.ok) {
      setError("Could not delete that staff member.");
      return;
    }
    load();
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8 px-6 py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-semibold">Manage Staff</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Edit, disable, delete, or report a lost ID card for any staff member.
        </p>
      </header>

      <label className="flex max-w-xs flex-col gap-1 text-sm">
        <span className="font-medium">Your name</span>
        <input
          type="text"
          value={performedBy}
          onChange={handleNameChange}
          placeholder="For the activity record"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="max-w-3xl overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading && (
              <tr><td className="px-4 py-4 text-neutral-500" colSpan={4}>Loading...</td></tr>
            )}
            {!loading && staff.length === 0 && (
              <tr><td className="px-4 py-4 text-neutral-500" colSpan={4}>No staff onboarded yet.</td></tr>
            )}
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{s.fullName}</p>
                  <p className="text-xs text-neutral-500">{s.badgeId}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{s.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {!s.enabled && (
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        Disabled
                      </span>
                    )}
                    {s.idLost && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                        ID Lost
                      </span>
                    )}
                    {s.enabled && !s.idLost && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      if (openMenu?.id === s.id) { setOpenMenu(null); return; }
                      const rect = e.currentTarget.getBoundingClientRect();
                      setOpenMenu({ id: s.id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
                    }}
                    disabled={busyId === s.id}
                    className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    {busyId === s.id ? "..." : "⋯"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openMenu && (() => {
        const s = staff.find((m) => m.id === openMenu.id);
        if (!s) return null;
        return (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
            <div
              style={{ top: openMenu.top, right: openMenu.right }}
              className="fixed z-40 w-48 rounded-md border border-neutral-200 bg-white py-1 text-left shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Link
                href={`/id-cards?staff=${s.id}`}
                className="block px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Edit staff details
              </Link>
              <button
                onClick={() => toggleStatus(s, { enabled: !s.enabled })}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                {s.enabled ? "Disable staff" : "Enable staff"}
              </button>
              <button
                onClick={() => toggleStatus(s, { idLost: !s.idLost })}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                {s.idLost ? "Mark ID as found" : "Mark ID as lost"}
              </button>
              <button
                onClick={() => handleDelete(s)}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Delete staff
              </button>
            </div>
          </>
        );
      })()}

      <section className="max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {activity.length > 0 && (
            <button
              onClick={handleClearActivity}
              disabled={clearingActivity}
              className="text-xs font-medium text-neutral-500 hover:text-red-600 disabled:opacity-50"
            >
              {clearingActivity ? "Clearing..." : "Clear"}
            </button>
          )}
        </div>
        <ul className="mt-3 divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
          {activity.length === 0 && (
            <li className="py-2 text-neutral-500">Nothing yet.</li>
          )}
          {activity.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <span>
                <span className="font-medium">{ACTION_LABELS[a.action] || a.action}</span>{" "}
                — {a.staffName}
                {a.performedBy && <span className="text-neutral-500"> by {a.performedBy}</span>}
              </span>
              <span className="text-xs text-neutral-400">{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
