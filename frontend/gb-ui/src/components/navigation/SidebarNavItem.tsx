import { NavLink } from "react-router-dom"

export default function SideBarNavItem({path,name}:{path:string,name:string}){

  const activeStyleStrong = "text-green-400 font-bold pointer-events-none"
  const pendingStyleString = "pointer-events-none"
  const transitioningStyleString = "pointer-events-none"
  const baseStyleString = "hover:text-green-400 my-4"

  return(
    <NavLink
      to={path}
      className={({isActive,isPending,isTransitioning})=>[
        isActive ? activeStyleStrong : "", 
        isPending ? pendingStyleString : "",
        isTransitioning ? transitioningStyleString : "",
        baseStyleString
      ].join(" ")}
      >
        {name}
      </NavLink>
  )
}