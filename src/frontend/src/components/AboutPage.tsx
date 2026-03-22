interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-900 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors"
          >
            ← Back to Game
          </button>
          <h1 className="text-xl font-bold text-white">About Rage Room</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            What is Rage Room?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-3">
            Rage Room is a free, browser-based stress-relief game that lets you
            smash virtual objects to release tension, frustration, and pent-up
            anger in a safe and satisfying way. Whether you've had a rough day
            at work, a difficult conversation, or just need to blow off steam,
            Rage Room gives you the outlet you need — no mess, no broken glass,
            and no regrets.
          </p>
          <p className="text-gray-300 leading-relaxed mb-3">
            The game is designed for anyone who needs a quick mental reset. It
            takes under a minute to start playing and requires no sign-up or
            installation. Just enter your name, pick up your virtual hammer, and
            start smashing. The more you smash, the higher your score — and the
            better you'll feel.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Rage Room was created by{" "}
            <strong className="text-white">DEEPANSHU DHINGRA</strong> as a
            passion project to combine gaming, wellness, and stress management
            into one fun experience. It is completely free to play in your
            browser and is installable as a Progressive Web App on both Android
            and iPhone devices.
          </p>
        </section>

        {/* Science of Smashing */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            The Science Behind Stress Relief
          </h2>
          <p className="text-gray-300 leading-relaxed mb-3">
            Stress is a natural physiological response to pressure and perceived
            threats. When we're stressed, our bodies release cortisol and
            adrenaline, preparing us for a "fight or flight" response. The
            problem in modern life is that we rarely get a physical outlet for
            this built-up tension — which is exactly where Rage Room comes in.
          </p>
          <p className="text-gray-300 leading-relaxed mb-3">
            Research in psychology suggests that physical expression — even
            simulated — can help activate the parasympathetic nervous system,
            lowering heart rate and reducing the feeling of stress. Repetitive
            tapping actions combined with visual and audio feedback create a
            satisfying loop that can interrupt anxious thought patterns and help
            redirect mental energy.
          </p>
          <p className="text-gray-300 leading-relaxed mb-3">
            Real-world rage rooms (physical smashing venues) have grown in
            popularity worldwide precisely because of this effect. Rage Room
            brings that same cathartic experience into your pocket — accessible
            anywhere, anytime, for free.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Think of it as a digital punching bag: a guilt-free,
            consequence-free way to vent frustration and walk away feeling
            lighter.
          </p>
        </section>

        {/* How to Play */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">How to Play</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-300 leading-relaxed">
            <li>
              <strong className="text-white">Enter your name</strong> on the
              welcome screen. This personalises your experience and puts you on
              the leaderboard.
            </li>
            <li>
              <strong className="text-white">Tap or click objects</strong> on
              the screen to smash them. Each smash earns you points. The faster
              you smash, the higher your combo multiplier.
            </li>
            <li>
              <strong className="text-white">
                Survive the 30-second round.
              </strong>{" "}
              Each round lasts 30 seconds. Smash as many objects as possible
              before the timer runs out.
            </li>
            <li>
              <strong className="text-white">Level Up</strong> to progress to
              the next round with harder objects and bigger rewards. Levels get
              progressively more challenging.
            </li>
            <li>
              <strong className="text-white">Trigger "SMASH IT ALL"</strong> — a
              special power move that appears every 15 seconds. Tap it to
              unleash a satisfying emoji blast and clear all objects at once for
              a massive point bonus.
            </li>
            <li>
              <strong className="text-white">Give Up</strong> anytime via the
              "GIVE UP" button to end the session and see your final score and
              rank on the leaderboard.
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Tips & Tricks
          </h2>
          <ul className="list-disc list-inside space-y-3 text-gray-300 leading-relaxed">
            <li>
              <strong className="text-white">Build combos:</strong> Tap objects
              in quick succession without pausing to stack your combo multiplier
              and maximise your score.
            </li>
            <li>
              <strong className="text-white">
                Save "SMASH IT ALL" for crowded screens:
              </strong>{" "}
              The power move is most effective when there are lots of objects on
              screen, giving you a bigger point haul.
            </li>
            <li>
              <strong className="text-white">Stay focused:</strong> The game
              gets faster and more chaotic in higher levels. Keep calm and tap
              systematically across the screen.
            </li>
            <li>
              <strong className="text-white">Use two thumbs on mobile:</strong>{" "}
              Playing on a phone? Use both thumbs simultaneously to double your
              tapping speed.
            </li>
            <li>
              <strong className="text-white">Take breaks:</strong> If you feel
              overwhelmed, pause and take a breath. The game is meant to relieve
              stress, not create it!
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-1">
                Is Rage Room free to play?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Yes, Rage Room is completely free to play in your browser. No
                account or payment required. A premium Rage Pass will be
                available in the future with extra features like longer rounds,
                exclusive hype lines, and a crown badge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Can I install it on my phone?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Yes! Rage Room is a Progressive Web App (PWA). On Android, open
                it in Chrome and tap "Add to Home Screen". On iPhone, open it in
                Safari, tap the Share button, then tap "Add to Home Screen". It
                will launch fullscreen like a native app.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Does it work on all devices?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Rage Room works on any modern smartphone, tablet, or desktop
                browser. It is fully touch-enabled and optimised for mobile
                play.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Is there a leaderboard?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Yes. After your first level, your score is compared to other
                players and you receive a rank. The leaderboard updates with
                every session, so you can always challenge yourself to climb
                higher.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Who made Rage Room?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Rage Room was created by{" "}
                <strong className="text-white">DEEPANSHU DHINGRA</strong>. It
                was built as a passion project to provide a fun, accessible
                stress-relief tool for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Privacy & Ads
          </h2>
          <p className="text-gray-300 leading-relaxed mb-3">
            Rage Room does not collect personal data beyond your chosen display
            name, which is stored locally in your browser and never sent to any
            external server.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The site displays advertisements served by Google AdSense to help
            support the ongoing development and hosting of the game. These ads
            are subject to Google's privacy policy and may use cookies to show
            relevant advertisements.
          </p>
        </section>

        {/* Credits */}
        <section>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Credits</h2>
          <p className="text-gray-300 leading-relaxed">
            Rage Room is designed, developed, and maintained by{" "}
            <strong className="text-white">DEEPANSHU DHINGRA</strong>. Built
            with ♥ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline"
            >
              caffeine.ai
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-6 text-center text-gray-500 text-sm">
        © 2026 DEEPANSHU DHINGRA. Built with ♥ using caffeine.ai
      </footer>
    </div>
  );
}
