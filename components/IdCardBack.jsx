"use client";

import { useEffect, useState } from "react";

export default function IdCardBack({ staff }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const verifyUrl = `${window.location.origin}/verify/${staff.id}`;
    import("qrcode").then((QRCode) =>
      QRCode.toDataURL(verifyUrl, { margin: 1, width: 200, color: { dark: "#171717", light: "#ffffff" } })
    ).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => { cancelled = true; };
  }, [staff.id]);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
          width: "100%",
          height: 28,
          background: "linear-gradient(120deg, #1e3a8a 0%, #2563eb 100%)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Scan to verify" style={{ width: 88, height: 88 }} />
        ) : (
          <div style={{ width: 88, height: 88, backgroundColor: "#f5f5f5", borderRadius: 6 }} />
        )}
        <p style={{ fontSize: 10, color: "#737373", margin: "6px 0 0" }}>Scan to verify staff details</p>
      </div>

      <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #e5e5e5", padding: "10px 20px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, color: "#a3a3a3", margin: 0 }}>Contact</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#171717", margin: "2px 0 0" }}>{staff.phone || staff.email}</p>
        <p style={{ fontSize: 9, color: "#a3a3a3", margin: "6px 0 0" }}>
          Property of MVP Design Build Firms. If found, please return.
        </p>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, width: 90, height: 8, background: "linear-gradient(120deg, #1e3a8a 0%, #2563eb 100%)" }} />
    </div>
  );
}
