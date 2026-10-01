export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 font-bold tracking-tight cursor-pointer" style={{ fontSize: size }}>
      <i className="ph-fill ph-plant text-primary-500 text-2xl"></i>
      <span className="text-white">Clove</span>
    </div>
  );
}
