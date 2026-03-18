export default function Spinner({ size = 'md', color = 'gold' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  const colors = { gold: 'border-[#C9A84C]', navy: 'border-[#1B2B4B]', white: 'border-white' };
  return (
    <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
}
