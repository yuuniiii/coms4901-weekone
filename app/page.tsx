import Link from "next/link"

export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      <h1>Hello World</h1>

      <Link
        href="/login"
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "black",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        Go to Login →
      </Link>
    </main>
  );
}
