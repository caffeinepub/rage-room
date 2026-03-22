import { ArrowLeft, Download } from "lucide-react";

const ads = [
  {
    label: "Square (1080x1080)",
    desc: "Best for Instagram posts, Facebook, WhatsApp",
    path: "/assets/generated/rage-room-ad.dim_1080x1080.jpg",
    filename: "rage-room-ad-square.jpg",
  },
  {
    label: "Landscape (1920x1080)",
    desc: "Best for YouTube banner, Twitter header, Facebook cover",
    path: "/assets/generated/rage-room-ad-landscape.dim_1920x1080.jpg",
    filename: "rage-room-ad-landscape.jpg",
  },
  {
    label: "Story (1080x1920)",
    desc: "Best for Instagram Stories, TikTok, WhatsApp Status",
    path: "/assets/generated/rage-room-ad-story.dim_1080x1920.jpg",
    filename: "rage-room-ad-story.jpg",
  },
];

interface Props {
  onBack: () => void;
}

function AdCard({ ad, index }: { ad: (typeof ads)[0]; index: number }) {
  return (
    <div
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
      data-ocid={`download_ads.item.${index + 1}`}
    >
      {/* The image itself - long-press on iPhone to save */}
      <img
        src={ad.path}
        alt={ad.label}
        className="w-full object-cover select-none"
        loading="lazy"
        style={{ WebkitTouchCallout: "default" } as React.CSSProperties}
      />
      <div className="p-4">
        <p className="font-bold text-lg">{ad.label}</p>
        <p className="text-gray-400 text-sm mb-3">{ad.desc}</p>

        {/* iPhone instructions */}
        <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-xl p-3 mb-3 text-sm text-yellow-200">
          <span className="font-bold">iPhone:</span> Hold the image above and
          tap <em>"Save to Photos"</em>
        </div>

        {/* Download button for Android / desktop */}
        <a
          href={ad.path}
          download={ad.filename}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
          data-ocid={`download_ads.download_button.${index + 1}`}
        >
          <Download size={18} />
          Download (Android / Laptop)
        </a>
      </div>
    </div>
  );
}

export default function DownloadAdsPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          data-ocid="download_ads.back_button"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-black text-center mb-2">
          <span className="text-red-500">RAGE ROOM</span> Ad Images
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Download and share on social media to promote the game
        </p>

        <div className="flex flex-col gap-8">
          {ads.map((ad, i) => (
            <AdCard key={ad.label} ad={ad} index={i} />
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-10">
          Created by DEEPANSHU DHINGRA
        </p>
      </div>
    </div>
  );
}
