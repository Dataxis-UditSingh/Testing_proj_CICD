import "./App.css";

function App() {
  return (
    <>
      <div className="h-screen flex items-center justify-center flex-col bg-black">

        <div className="w-96 h-96 mb-8 rounded-full overflow-hidden">
          <img src="https://www.spinny.com/blog/wp-content/uploads/2024/09/videoframe_0.webp" alt="Car_Image" className="h-full w-full object-cover" />
        </div>
        <p className="text-white text-3xl text-center mt-4">
          This was Testing project for CICD Pipeline chekup.
        </p>
        <h1 className="text-pink-800 text-5xl font-semibold text-center">
          Testing project for CICD
        </h1>
        <p className="text-pink-600 text-lg text-center mt-4">
          This was Testing project for Image Automation.
        </p>
      </div>
    </>
  );
}

export default App;
