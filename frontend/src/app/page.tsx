import { Code, Users, Star } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to DevFlow
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The ultimate platform for developers to showcase projects, get peer reviews, and discover opportunities
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Code className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Showcase Projects</h3>
            <p className="text-gray-600">Display your best work with GitHub integration</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Peer Reviews</h3>
            <p className="text-gray-600">Get valuable feedback from fellow developers</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
            <p className="text-gray-600">Connect with recruiters and dream jobs</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}