import { NavLink } from "react-router-dom"

export default function SideBarNavItem({path,name, isDisabled}:{path:string,name:string, isDisabled:boolean}){

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
        baseStyleString,
        isDisabled ? "pointer-events-none opacity-50 cursor-not-allowed" : ""
      ].join(" ")}>
        {name}
    </NavLink>
  )
}