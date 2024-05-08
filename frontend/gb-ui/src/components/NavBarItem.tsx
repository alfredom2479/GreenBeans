import { NavLink } from "react-router-dom"
//import linkSvg from '../assets/link.svg';

interface componenetParams {
  name: string,
  path: string,
  svgPath: string

}

export default function NavbarItem({name,path,svgPath}:componenetParams){

  const styleString = "flex basis-32 items-center justify-center "
  +"text-xl font-bold hover:text-purple-600 m-1 mx-2 "
  +" rounded-3xl"

  return(
    <NavLink 
      to={path}
      className={({isActive,isPending,isTransitioning})=> [
        !isActive? styleString : styleString+" bg-purple-800 pointer-events-none",
        isPending ? "pointer-events-none" : "",
        isTransitioning ? "pointer-events-none": ""
      ].join(" ")
    }
    >
      <img src={svgPath} alt={name} className="w-8 text-white "/>
    </NavLink>
  )
}