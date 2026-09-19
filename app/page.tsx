export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6">
      <div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-lime-400 text-xl font-semibold tracking-tight text-lime-400"
        title="G0"
      >
        G0
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          GatherZero
        </h1>
        <p className="mt-3 text-lg text-neutral-400">
          Plan the event. Cut the footprint.
        </p>
      </div>
    </main>
  );
}
