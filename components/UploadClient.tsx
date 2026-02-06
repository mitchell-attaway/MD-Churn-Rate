"use client";

import { useState } from "react";

export default function UploadClient() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      setStatus("Upload failed. Please check the file and try again.");
      setLoading(false);
      return;
    }
    setStatus("Upload complete. The dashboard is updated.");
    setLoading(false);
    form.reset();
  };

  return (
    <form className="row" onSubmit={onSubmit}>
      <input className="input" type="file" name="file" accept=".csv" required />
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
      {status ? <div className="small">{status}</div> : null}
    </form>
  );
}
