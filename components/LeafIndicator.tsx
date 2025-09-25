'use client';
type State = 'red' | 'yellow' | 'green';
export function LeafIndicator({ state = 'green' as State }) {
  const color = state === 'red' ? 'bg-red-500' : state === 'yellow' ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} animate-[pulse-leaf_1.8s_ease-in-out_infinite]`} />
      <span className="text-sm text-neutral-300 capitalize">{state}</span>
    </div>
  );
}
