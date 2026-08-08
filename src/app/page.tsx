import UI from '@/components/UI';
import Game from '@/components/Game';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black selection:bg-red-500/30">
      <UI />
      <Game />
    </main>
  );
}
