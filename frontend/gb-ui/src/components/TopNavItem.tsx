import { NavLink } from "react-router-dom"

export default function TopNavItem({path,name}:{path:string, name:string}){

  const ActiveNavLinkStyles = "text-green-200 text-center w-full text-2xl align-middle truncate"
  const DefaultNavLinkStyles = "text-center w-full text-2xl align-middle truncate"
  
  return (
    <li className="flex-1 flex justify-center content-center">
      <NavLink to={path}
      className={({isActive})=> isActive ?  ActiveNavLinkStyles : DefaultNavLinkStyles}>
        {name}
      </NavLink> 
    </li>
  )
}