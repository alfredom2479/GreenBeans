import { requestAuth } from "../api";

// u actually don't need this at all
export async function action(){
  console.log("in action");
  try{
    const data = await requestAuth();
    console.log(data);
  }catch(err){
    return err;
  }
  
}

export default function HomePage(){
  
  return(
    <>
      <a href="api/auth/requestauth">Log In to spotify!</a>
    </>
  )
}