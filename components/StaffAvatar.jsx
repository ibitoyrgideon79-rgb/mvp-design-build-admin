"use client";

import { useState } from "react";

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default function StaffAvatar({ photoUrl, fullName, className, textClassName }) {
  const [failed, setFailed] = useState(false);

  if (photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" onError={() => setFailed(true)} className={`${className} object-cover`} />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-neutral-100 font-semibold text-neutral-500 dark:bg-neutral-800 ${textClassName || ""}`}>
      {initials(fullName)}
    </div>
  );
}
