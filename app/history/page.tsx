import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readHistoryIndex } from "@/lib/history";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  requireAdmin();
  const entries = readHistoryIndex();

  return (
    <div className="page">
      <div className="nav">
        <div className="row">
          <Link href="/" className="chip">
            Company View
          </Link>
          <Link href="/upload" className="chip">
            Upload CSV
          </Link>
          <div className="chip">History</div>
        </div>
        <form action="/api/logout" method="post">
          <button className="button ghost" type="submit">
            Log out
          </button>
        </form>
      </div>

      <section className="hero">
        <h1>Upload history</h1>
        <p>Select a previous snapshot to view. Only admins can access this page.</p>
      </section>

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Uploaded</th>
              <th>Snapshot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3}>No uploads yet.</td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.uploadedAt).toLocaleString("en-US")}</td>
                  <td>{entry.filename}</td>
                  <td>
                    <Link className="button secondary" href={`/?snapshot=${entry.id}`}>
                      View company snapshot
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
