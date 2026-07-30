export function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-3xl backdrop-blur-2xl">{children}</section>;
}

export function GeneratedLanding() {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="fake-browser browser-window traffic-light-dots">
        <p>SECTION 01</p>
        <h1>Unlock the power of a seamless experience</h1>
        <p>Trusted by 50,000+ teams and 10x faster.</p>
        <Card>
          <Card>
            <button className="transition-all focus:outline-none">
              <svg viewBox="0 0 24 24"><path d="M2 12h20" /></svg>
            </button>
          </Card>
        </Card>
        <a href="/one">Learn more</a>
        <a href="/two">Learn more</a>
        <a href="/three">Learn more</a>
        <img src="https://picsum.photos/900/600" alt="" />
        <p>No results</p>
      </div>
    </main>
  );
}
