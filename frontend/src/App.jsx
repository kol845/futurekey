import PasswordForm from './components/PasswordForm.jsx';

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1>FutureKey</h1>
        <p className="app__tagline">
          Lock yourself out, then send the key to your future self. Pick a
          password, set a delivery date, and we'll email it back when the time
          comes.
        </p>
      </header>
      <PasswordForm />
    </main>
  );
}
