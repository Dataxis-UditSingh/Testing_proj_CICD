import "./App.css";

function App() {
  return (
    <>
      <div className="h-screen flex items-center justify-center flex-col bg-black">
        <div className="w-96 h-96 rounded-2xl overflow-hidden">
          <img src="https://www.spinny.com/blog/wp-content/uploads/2024/09/videoframe_0.webp" alt="Car_Image" className="h-full w-full object-cover" />
        </div>
        <p className="text-white text-3xl text-center pt-5">
          This was Testing project for CICD Pipeline chekup.
        </p>
        <h1 className="text-pink-800 text-5xl font-semibold text-center">
          Testing project for CICD
        </h1>
      </div>
    </>
  );
}

export default App;
