import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

        <div className="grid md:grid-cols-2">

          {/* Image Section */}
          <div className="h-80 md:h-full">
            <img
              src="https://media.istockphoto.com/id/537331500/photo/programming-code-abstract-technology-background-of-software-deve.jpg?s=612x612&w=0&k=20&c=jlYes8ZfnCmD0lLn-vKvzQoKXrWaEcVypHnB5MuO-g8="
              alt="Nature"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-center p-10">
            <span className="inline-flex w-fit items-center px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
              ✓ CI/CD Pipeline Active
            </span>

            <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight">
              CI/CD Pipeline
              <span className="block text-cyan-400 mt-2">
                Testing Project
              </span>
            </h1>

            <p className="mt-6 text-slate-300 text-lg leading-relaxed">
              This project demonstrates a complete CI/CD workflow using
              Docker, Tekton, FluxCD, and Kubernetes. Every code change
              automatically triggers build, image creation, and deployment
              processes.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <span className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Docker
              </span>

              <span className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Tekton
              </span>

              <span className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20">
                FluxCD
              </span>

              <span className="px-4 py-2 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">
                Kubernetes
              </span>
            </div>

            <div className="mt-8">
              <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 transition-all rounded-xl text-white font-semibold">
                Pipeline Status: Running
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;