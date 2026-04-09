export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-5xl mb-4 animate-pulse">🏥</div>
      <p className="text-primary-600 font-semibold text-lg">TéléMéd Congo</p>
      <p className="text-gray-400 text-sm mt-1">Chargement...</p>
    </div>
  );
}
