"use client";

import { useState } from "react";

// Plain inline styles (not Tailwind color utilities) on purpose: this card
// gets rasterized by html-to-image for the Download button, and the app's
// global stylesheet (Tailwind v4, which compiles colors to oklch()/lab())
// has caused rasterization libraries trouble in the past. A printable ID
// badge shouldn't flip with the app's dark mode anyway, so a fixed light
// card is the right look here too.
function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function IdCardFront({ staff }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height: 214,
        width: 340,
        borderRadius: 12,
        border: "1px solid #d4d4d4",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          height: 64,
          background: "linear-gradient(120deg, #1e3a8a 0%, #2563eb 100%)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, letterSpacing: 0.5, margin: 0 }}>
          MVP <span style={{ fontWeight: 400 }}>Design Build</span>
        </p>
        <p style={{ marginLeft: "auto", color: "#dbeafe", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          STAFF ID
        </p>
      </div>

      {staff.photoUrl && !photoFailed ? (
        <img
          src={staff.photoUrl}
          alt=""
          onError={() => setPhotoFailed(true)}
          style={{
            position: "absolute", top: 34, left: 20,
            width: 60, height: 60, borderRadius: "50%", objectFit: "cover",
            border: "3px solid #ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute", top: 34, left: 20,
            width: 60, height: 60, borderRadius: "50%",
            backgroundColor: "#eff6ff", border: "3px solid #ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#2563eb",
          }}
        >
          {initials(staff.fullName)}
        </div>
      )}

      <div style={{ marginTop: 40, padding: "0 20px" }}>
        <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: "#171717", margin: 0 }}>{staff.fullName}</p>
        <p style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, margin: "2px 0 0" }}>{staff.role}</p>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: 20, right: 20, display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e5e5", paddingTop: 10 }}>
        <div>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, color: "#a3a3a3", margin: 0 }}>Department</p>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#171717", margin: "2px 0 0" }}>{staff.department}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, color: "#a3a3a3", margin: 0 }}>ID</p>
          <p style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#171717", margin: "2px 0 0" }}>{staff.badgeId}</p>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, right: 0, width: 90, height: 8, background: "linear-gradient(120deg, #1e3a8a 0%, #2563eb 100%)" }} />
    </div>
  );
}
