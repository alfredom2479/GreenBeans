import { NavLink } from "react-router-dom"

export default function NavbarItem({name,path, extraStyle}:{name:string,path:string,extraStyle:string}){

  const styleString = "flex basis-32 items-center justify-center bg-stone-900 "
  +"text-xl font-bold text-purple-200 hover:text-purple-600 mb-0 "
  +"border-white hover:border-purple-600 "

  return(
    <NavLink 
      to={path}
      className= {styleString+" "+extraStyle}
    >
      {name}
    </NavLink>
  )
}