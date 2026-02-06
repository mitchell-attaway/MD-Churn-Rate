import Link from "next/link";
import UploadClient from "@/components/UploadClient";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  requireAdmin();

  return (
    <div className="page">
      <div className="nav">
        <div className="row">
          <Link href="/" className="chip">
            Company View
          </Link>
          <div className="chip">Upload CSV</div>
          <Link href="/history" className="chip">
            History
          </Link>
        </div>
        <form action="/api/logout" method="post">
          <button className="button ghost" type="submit">
            Log out
          </button>
        </form>
      </div>

      <section className="hero">
        <h1>Upload new churn CSV</h1>
        <p>
          Drop in the latest export from Google Sheets. The dashboard will refresh immediately using
          the new file. Admins only.
        </p>
        <UploadClient />
        <div className="small">
          Tip: make sure the columns match the 2026 churn export format.
        </div>
        <div className="small">Uploads are saved to history for admin review.</div>
      </section>
    </div>
  );
}
