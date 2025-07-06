'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, X, Plus, Upload, Github, ExternalLink, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectData {
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  challenges: string;
  learnings: string;
  githubUrl: string;
  liveUrl: string;
  videoUrl: string;
  technologies: string[];
  category: string;
  status: string;
}

const CreateProject = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [project, setProject] = useState<ProjectData>({
    title: '',
    description: '',
    longDescription: '',
    features: [],
    challenges: '',
    learnings: '',
    githubUrl: '',
    liveUrl: '',
    videoUrl: '',
    technologies: [],
    category: 'WEB_APP',
    status: 'IN_PROGRESS'
  });

  useEffect(() => {
    if (!user || !token) {
      router.push('/');
    }
  }, [user, token, router]);

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !project.features.includes(newFeature.trim()) && project.features.length < 10) {
      setProject(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setProject(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const addTechnology = () => {
    if (newTech.trim() && !project.technologies.includes(newTech.trim()) && project.technologies.length < 15) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!project.title.trim()) {
      setError('Project title is required');
      setLoading(false);
      return;
    }

    if (project.technologies.length === 0) {
      setError('At least one technology is required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      // Add project data
      Object.entries(project).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append('projectImages', image);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/projects/${data.project.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create project');
      }
    } catch (error) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/projects"
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">Showcase your latest development work</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your project title..."
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={project.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief one-line description..."
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">{project.description.length}/200 characters</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={project.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WEB_APP">Web Application</option>
                    <option value="MOBILE_APP">Mobile Application</option>
                    <option value="API">API/Backend</option>
                    <option value="LIBRARY">Library/Package</option>
                    <option value="TOOL">Tool/Utility</option>
                    <option value="GAME">Game</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={project.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Technologies Used *</h2>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a technology (e.g., React, Node.js)..."
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  disabled={!newTech.trim() || project.technologies.length >= 15}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">Maximum 15 technologies</p>
            </div>

            {/* Project Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Images</h2>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Upload project images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={selectedImages.length >= 5}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">
                    PNG, JPG, WebP up to 5MB each. Maximum 5 images.
                  </p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Links</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Github className="w-4 h-4 inline mr-2" />
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    value={project.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="w-4 h-4 inline mr-2" />
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={project.liveUrl}
                    onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demo Video URL
                  </label>
                  <input
                    type="url"
                    value={project.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={project.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  rows={6}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide a detailed description of your project, its purpose, and how it works..."
                />
                <p className="text-sm text-gray-500 mt-1">{project.longDescription.length}/2000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenges & Solutions
                </label>
                <textarea
                  value={project.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the main challenges you faced and how you solved them..."
                />
                <p className="text-sm text-gray-500 mt-1">{project.challenges.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Learnings
                </label>
                <textarea
                  value={project.learnings}
                  onChange={(e) => handleInputChange('learnings', e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What did you learn from this project? What would you do differently?"
                />
                <p className="text-sm text-gray-500 mt-1">{project.learnings.length}/1000 characters</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Key Features</h2>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {project.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a key feature..."
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={!newFeature.trim() || project.features.length >= 10}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">Maximum 10 features</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end space-x-4">
              <Link
                href="/projects"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;