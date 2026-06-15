import "./App.css";

function App() {
  return (
    <>
      <div className="h-screen flex items-center justify-center flex-col bg-black space-y-5">
        <div className="w-96 h-96 rounded-full overflow-hidden">
          <img src="https://images.unsplash.com/photo-1620053580376-3de604e91953?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhdXRpZnVsJTIwbmF0dXJlfGVufDB8fDB8fHww" alt="Car_Image" className="h-full w-full object-cover" />
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
