import './App.css'

const features = [
  {
    title: 'Setup a class match',
    description: 'Choose a class name, set a round goal, and get everyone ready in seconds.',
  },
  {
    title: 'Track each challenge',
    description: 'Use clear score cards so students can see what happens in every round.',
  },
  {
    title: 'Celebrate progress',
    description: 'Highlight team wins, bonus tasks, and the next target before the lesson ends.',
  },
]

function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Schoolgame</p>
        <h1>Start building the classroom game experience</h1>
        <p className="intro">
          The project now has a Vite + React + TypeScript setup with a simple TSX interface
          that is ready for the next gameplay features.
        </p>
        <div className="hero__actions">
          <button type="button">Start planning</button>
          <a href="#how-to-play">See the flow</a>
        </div>
      </header>

      <section className="panel" aria-labelledby="highlights-title">
        <div className="section-heading">
          <p className="section-label">What is included</p>
          <h2 id="highlights-title">A fundamental HTML UI to build on</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-to-play" className="panel panel--muted" aria-labelledby="flow-title">
        <div className="section-heading">
          <p className="section-label">Suggested flow</p>
          <h2 id="flow-title">Ready for the next TSX steps</h2>
        </div>
        <ol className="flow-list">
          <li>Create teams and choose a challenge theme.</li>
          <li>Track scores, turns, and rewards in reusable React components.</li>
          <li>Expand the interface into the full classroom game loop.</li>
        </ol>
      </section>
    </main>
  )
}

export default App
