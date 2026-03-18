export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
