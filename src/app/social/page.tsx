import Link from "next/link";

export const metadata = {
  title: "Sosyal Medya Görselleri | Alo17",
  description: "Alo17 sosyal medya tanıtım görselleri (Facebook).",
};

export default function SocialAssetsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sosyal Medya Görselleri</h1>
        <p className="text-gray-600 mt-2">
          Facebook için hazır SVG görseller. Masaüstünde açıp indirerek Canva/Photoshop’a atabilirsiniz.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">Story / Reels (9:16)</div>
                <div className="text-sm text-gray-600">1080×1920</div>
              </div>
              <Link
                href="/social/facebook-story-alo17.svg"
                className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-4"
              >
                Aç / İndir
              </Link>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden border">
              <img
                src="/social/facebook-story-alo17.svg"
                alt="Alo17 Facebook Story"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">Feed (4:5)</div>
                <div className="text-sm text-gray-600">1080×1350</div>
              </div>
              <Link
                href="/social/facebook-feed-alo17.svg"
                className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-4"
              >
                Aç / İndir
              </Link>
            </div>
            <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden border">
              <img
                src="/social/facebook-feed-alo17.svg"
                alt="Alo17 Facebook Feed"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <div className="font-semibold text-gray-900 mb-2">Not</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>SVG açınca “Farklı kaydet” ile indirebilirsin.</li>
            <li>PNG/JPG gerekiyorsa Canva’ya yükleyip PNG olarak dışa aktar.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

