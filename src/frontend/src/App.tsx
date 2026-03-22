import { useState } from "react";
import AboutPage from "./components/AboutPage";
import DownloadAdsPage from "./components/DownloadAdsPage";
import NameModal from "./components/NameModal";
import RageRoom from "./components/RageRoom";
import WelcomePage from "./components/WelcomePage";

type AppFlow = "welcome" | "naming" | "playing" | "about" | "download-ads";

export default function App() {
  const [flow, setFlow] = useState<AppFlow>("welcome");
  const [playerName, setPlayerName] = useState("");
  const [prevFlow, setPrevFlow] = useState<AppFlow>("welcome");

  const goAbout = () => {
    setPrevFlow(flow === "about" ? "welcome" : flow);
    setFlow("about");
  };

  const goDownloadAds = () => {
    setPrevFlow(flow);
    setFlow("download-ads");
  };

  if (flow === "about") {
    return (
      <AboutPage
        onBack={() => setFlow(prevFlow === "about" ? "welcome" : prevFlow)}
      />
    );
  }

  if (flow === "download-ads") {
    return (
      <DownloadAdsPage
        onBack={() =>
          setFlow(prevFlow === "download-ads" ? "welcome" : prevFlow)
        }
      />
    );
  }

  if (flow === "playing") {
    return <RageRoom playerName={playerName} onAbout={goAbout} />;
  }

  return (
    <>
      <WelcomePage
        onEnter={() => setFlow("naming")}
        onAbout={goAbout}
        onDownloadAds={goDownloadAds}
      />
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
