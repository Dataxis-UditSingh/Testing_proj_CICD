import "./App.css";

function App() {
  return (
    <>
      <div className="h-screen flex items-center justify-center flex-col bg-gray-500">
        <h1 className="text-blue-800 text-5xl font-semibold text-center">
          Testing project for CICD
        </h1>
        <p className="text-white text-lg text-center mt-4">
          This was Testing project for checking the CD pipeline using GitHub Actions and FluxCD. The React app is deployed on Kubernetes cluster using FluxCD and the image is built and pushed to Docker Hub using GitHub Actions.
        </p>
      </div>
    </>
  );
}

export default App;
