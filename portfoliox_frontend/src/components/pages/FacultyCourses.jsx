import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';

const maroon = "#800000";
const gold = "#D4AF37";

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '' });
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem('token');
  const facultyId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/courses/faculty/${facultyId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:8080/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create course');
      }
      setNewCourse({ courseCode: '', courseName: '' });
      setSuccess('Course created successfully!');
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setProjects([]);
    setProjectLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/courses/${course.courseCode}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleValidateProject = async (projectId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`http://localhost:8080/api/portfolios/${projectId}/validate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to validate project');
      }
      setSuccess('Project validated!');
      // Refresh project list
      if (selectedCourse) handleSelectCourse(selectedCourse);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Courses</h1>
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2 text-[#800000]">Create New Course</h2>
        <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Course Code (e.g. CSIR 112)"
              value={newCourse.courseCode}
              onChange={e => setNewCourse(c => ({ ...c, courseCode: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.courseName}
              onChange={e => setNewCourse(c => ({ ...c, courseName: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
            <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] flex items-center gap-1">
              <Plus size={16} /> Add
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No courses found. Create one above.</div>
        ) : (
          courses.map(course => (
            <div key={course.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all ${selectedCourse && selectedCourse.id === course.id ? 'ring-2 ring-[#800000]' : ''}`}
              onClick={() => handleSelectCourse(course)}
            >
              <div className="font-bold text-lg text-[#800000]">{course.courseCode}</div>
              <div className="text-gray-700 dark:text-gray-300 mb-2">{course.courseName}</div>
              <div className="text-xs text-gray-500">Created by you</div>
            </div>
          ))
        )}
      </div>
      {selectedCourse && (
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#800000]">Projects for {selectedCourse.courseCode} - {selectedCourse.courseName}</h2>
            <button onClick={() => setSelectedCourse(null)} className="text-gray-500 hover:text-[#800000]">Close</button>
          </div>
          {projectLoading ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 text-[#800000] animate-spin" /></div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-500">No projects found for this course.</div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.portfolioID} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#800000]" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{project.portfolioTitle}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{project.portfolioDescription}</div>
                      <div className="text-xs text-gray-500">By Student ID: {project.user?.userID || project.userID}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.validatedByFaculty ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} /> Validated
                      </span>
                    ) : (
                      <button
                        onClick={() => handleValidateProject(project.portfolioID)}
                        className="px-4 py-2 bg-[#D4AF37] text-[#800000] rounded-lg hover:bg-[#B8860B] flex items-center gap-1"
                      >
                        <CheckCircle size={16} /> Validate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 