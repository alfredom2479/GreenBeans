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
    </>
  )
}