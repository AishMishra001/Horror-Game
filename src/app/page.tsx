import UI from '@/components/UI';
import Game from '@/components/Game';

export default function Home() {
  return (
    <main className="relative w-full h-[100dvh] h-screen overflow-hidden bg-black select-none touch-none selection:bg-red-500/30">
      <UI />
      <Game />
    </main>
  );
}

