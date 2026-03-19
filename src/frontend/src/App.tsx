import { useState } from "react";
import NameModal from "./components/NameModal";
import RageRoom from "./components/RageRoom";
import WelcomePage from "./components/WelcomePage";

type AppFlow = "welcome" | "naming" | "playing";

export default function App() {
  const [flow, setFlow] = useState<AppFlow>("welcome");
  const [playerName, setPlayerName] = useState("");

  if (flow === "playing") {
    return <RageRoom playerName={playerName} />;
  }

  return (
    <>
      <WelcomePage onEnter={() => setFlow("naming")} />
      <NameModal
        open={flow === "naming"}
        onConfirm={(name) => {
          setPlayerName(name);
          setFlow("playing");
        }}
        onClose={() => setFlow("welcome")}
      />
    </>
  );
}
