/**
 * Страница-заглушка корневой ленты до Phase 3.
 * В Phase 3 здесь появится полноценная Home с Hero + Search + Feed.
 */
export default function HomePage() {
  return (
    <main className="container flex min-h-screen items-center justify-center">
      <div className="glass rounded-2xl p-10 text-center">
        <h1 className="font-display text-4xl font-bold text-gradient">Global Grant Wiki</h1>
        <p className="mt-3 text-muted-foreground">
          Phase 1 (Setup &amp; Types) завершён. UI собирается в Phase 2–3.
        </p>
      </div>
    </main>
  );
}
