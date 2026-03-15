import { NavLink } from "react-router-dom";

export default function TopNavItem({ path, name, onClick }: { path: string; name: string; onClick: () => void }) {
  return (
    <li className="flex-1 flex min-w-0">
      <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive, isPending, isTransitioning }) =>
          [
            "flex-1 flex items-center justify-center py-2 px-3 text-sm font-medium rounded-md transition-colors",
            isActive
              ? "bg-zinc-700 text-white pointer-events-none"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700/70",
            isPending ? "pointer-events-none" : "",
            isTransitioning ? "pointer-events-none" : "",
          ].join(" ")
        }
      >
        {name}
      </NavLink>
    </li>
  );
}