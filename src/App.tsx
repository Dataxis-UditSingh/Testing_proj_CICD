import "./App.css";
import Button from "./components/Button";
import Heading from "./components/Heading";
import Tag from "./components/Tag";

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

            <Heading
              title="CI/CD Pipeline"
              highlight="Testing Project"
            />

            <h1 className="text-xl font-semibold my-2 text-gray-400">DevOps Multi-Tenant Test</h1>

            <p className="mt-6 text-slate-300 text-lg leading-relaxed">
              This project Demonstrates a complete CI/CD workflow using
              Docker, Tekton, FluxCD, and Kubernetes. Every code change
              automatically triggers build, image creation, and deployment
              processes.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Tag className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20">Docker</Tag>
              <Tag className="bg-purple-500/10 text-purple-300 border-purple-500/20">Tekton</Tag>
              <Tag className="bg-orange-500/10 text-orange-300 border-orange-500/20">FluxCD</Tag>
              <Tag className="bg-green-500/10 text-green-300 border-green-500/20">Kubernetes</Tag>
              <Tag className="bg-pink-500/10 text-pink-300 border-pink-500/20">Minikube</Tag>
              <Tag className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20">GitOps</Tag>
            </div>

            <div className="mt-8">
              <Button>Pipeline Status: Running</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;