import PasswordForm from './components/PasswordForm.jsx';

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1>FutureKey</h1>
        <p className="app__tagline">
          Lock yourself out, then send the key to your future self.
        </p>
      </header>
      <PasswordForm />
      <footer className="app__footnote">
        Your password is timelock-encrypted in the browser, so it can't be opened
        by anyone — not even us — until the delivery date, when we email it back.
      </footer>
    </main>
  );
}
