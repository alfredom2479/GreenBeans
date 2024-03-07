import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RootErrorBoundary(){
  const error = useRouteError();
  console.log(error);

  return (
    <>
    {  isRouteErrorResponse(error)?
      <div>
        <h1 className="text-6xl text-white">
          Error {error.status}
        </h1>
        <h2 className="text-2xl text-white">
          {error.data}
        </h2>
        
      </div>
      :
      <div className="text-2xl text-white">
        Something has gone horribly wrong.
      </div>
    }
    <div className="flex justify-center m-48">
    <a  className="flex bg-green-800 text-5xl font-medium p-2 rounded-3xl shadow-lg shadow-black-900" href="/">Home</a>
    </div>
    </>
  )
}