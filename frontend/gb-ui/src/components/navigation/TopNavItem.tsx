import { NavLink } from "react-router-dom";

export default function TopNavItem({path,name,onClick}:{path:string, name:string, onClick:()=>void}){

  const ActiveNavLinkStyles = "text-green-400 text-center w-full text-2xl align-middle truncate pointer-events-none"
  const DefaultNavLinkStyles = "text-center w-full text-2xl align-middle truncate hover:text-green-200"
  
  return (
    <li className="flex-1 flex justify-center content-center">
      <NavLink to={path}
        onClick={onClick}
        className={({isActive,isPending,isTransitioning})=> [
          isActive ?  ActiveNavLinkStyles : DefaultNavLinkStyles,
          isPending ? "pointer-events-none" : "",
          isTransitioning ? "pointer-events-none" : ""
        ].join(" ")
      }>
        {name}
      </NavLink> 
    </li>
  )
}