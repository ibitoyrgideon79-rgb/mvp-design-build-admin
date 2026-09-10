import { getStaff } from "../../../lib/staffStore";

const CONTACT_EMAIL = process.env.COMPANY_CONTACT_EMAIL;
const CONTACT_ADDRESS = process.env.COMPANY_CONTACT_ADDRESS;

export default async function VerifyStaffPage({ params }) {
  const { id } = await params;
  const staff = await getStaff(id);

  if (!staff) {
    return (
      <Shell>
        <p className="text-lg font-semibold">Not found</p>
        <p className="mt-1 text-sm text-neutral-500">This ID card could not be verified.</p>
      </Shell>
    );
  }

  // Lost overrides everything else, including a disabled card - a lost card
  // should never show the staff member's personal contact details to
  // whoever scans it, active or not.
  if (staff.idLost) {
    return (
      <Shell>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
          Reported Lost
        </div>
        <p className="mt-5 text-lg font-semibold">This ID card has been reported lost.</p>
        <p className="mt-2 text-sm text-neutral-500">
          If you found it, please{" "}
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              contact us at {CONTACT_EMAIL}
            </a>
          ) : (
            "contact the company that issued it"
          )}
          {CONTACT_ADDRESS && <> or return it to {CONTACT_ADDRESS}</>}.
        </p>
      </Shell>
    );
  }

  if (!staff.enabled) {
    return (
      <Shell>
        <p className="text-lg font-semibold">Not an active staff member</p>
        <p className="mt-2 text-sm text-neutral-500">This ID card is no longer active.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified Staff
      </div>

      {staff.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={staff.photoUrl} alt="" className="mx-auto mt-5 h-24 w-24 rounded-full object-cover" />
      ) : (
        <div className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-2xl font-semibold text-neutral-500 dark:bg-neutral-800">
          {staff.fullName.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
        </div>
      )}

      <p className="mt-4 text-xl font-semibold">{staff.fullName}</p>
      <p className="text-sm text-neutral-500">{staff.role}</p>

      <dl className="mt-6 space-y-3 text-left text-sm">
        <Row label="Department" value={staff.department} />
        <Row label="Staff ID" value={staff.badgeId} />
        <Row label="Employment type" value={staff.employmentType} />
        <Row
          label="Phone"
          value={staff.phone}
          href={staff.phone ? `tel:${staff.phone}` : null}
        />
        <Row label="Email" value={staff.email} href={`mailto:${staff.email}`} />
      </dl>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-100 px-6 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-lg font-extrabold tracking-tight">
          MVP <span className="font-normal text-neutral-500">Design Build</span>
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

function Row({ label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
      <dt className="text-neutral-500">{label}</dt>
      {href ? (
        <a href={href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          {value}
        </a>
      ) : (
        <dd className="font-medium">{value}</dd>
      )}
    </div>
  );
}
