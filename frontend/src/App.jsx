import Kee from './components/Kee.jsx';
import PasswordForm from './components/PasswordForm.jsx';

export default function App() {
  return (
    <div className="page">
      <main className="app">
        <header className="hero">
          <Kee size={104} />
          <h1 className="hero__title">
            Future<span>Key</span>
          </h1>
          <p className="hero__tagline">Lock yourself out. On purpose.</p>
          <p className="hero__sub">
            Pick a password, hand it to Kee, and we'll mail it back to future you
            on the date you choose. Until then, you're locked out.
          </p>
        </header>
        <PasswordForm />
        <footer className="footer">Kee will keep your key safe until it's time.</footer>
      </main>
    </div>
  );
}
