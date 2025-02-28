interface AvatarProps {
  name: string;
  color: string;
}

export function Avatar({ name, color }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${color}`}
    >
      {initials}
    </div>
  );
}
