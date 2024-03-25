import { NavLink } from "react-router-dom"
//import linkSvg from '../assets/link.svg';

interface componenetParams {
  name: string,
  path: string,
  extraStyle: string,
  svgPath: string

}

export default function NavbarItem({name,path, extraStyle,svgPath}:componenetParams){

  const styleString = "flex basis-32 items-center justify-center bg-stone-900 "
  +"text-xl font-bold text-purple-200 hover:text-purple-600 m-1 mx-2 "
  +" rounded-3xl"

  return(
    <NavLink 
      to={path}
      className= {styleString+" "+extraStyle}
    >
      <img src={svgPath} alt={name} className="w-8 text-white"/>
    </NavLink>
  )
}