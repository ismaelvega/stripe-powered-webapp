'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Header from '@/components/layout/header';

export default function CursosPage() {
  const [activeFilter, setActiveFilter] = useState<'completadas' | 'progreso' | null>(null);
  
  // For demonstration, we'll show different states
  const [hasCourses, setHasCourses] = useState(false);

  const courses = [
    { id: 1, name: 'Curso 1', price: '$10', progress: 2 },
    { id: 2, name: 'Curso 2', price: '$10', progress: 2 },
    { id: 3, name: 'Curso 3', price: '$10', progress: 2 },
    { id: 4, name: 'Curso 4', price: '$10', progress: 2 },
    { id: 5, name: 'Curso 5', price: '$10', progress: 2 },
    { id: 6, name: 'Curso 6', price: '$10', progress: 2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Tus cursos</h1>
          </div>

        {/* Filters */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveFilter('completadas')}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
              activeFilter === 'completadas'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => setActiveFilter('progreso')}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
              activeFilter === 'progreso'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            En progreso
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          {!hasCourses ? (
            <div className="text-center">
              <p className="text-gray-500 text-lg">Aún no tienes cursos</p>
              <button
                onClick={() => setHasCourses(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simular cursos (Demo)
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="w-full h-32 border border-gray-300 rounded-lg p-4 bg-white">
                    <div className="font-semibold text-sm mb-2">
                      {course.name} {course.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      Completado el {course.progress}% restante
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setHasCourses(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Volver a estado vacío (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
