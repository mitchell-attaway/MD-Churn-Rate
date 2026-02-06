import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Director not found</h1>
        <p>The director name in the URL did not match the dataset.</p>
        <Link className="button" href="/">
          Back to company view
        </Link>
      </section>
    </div>
  );
}
