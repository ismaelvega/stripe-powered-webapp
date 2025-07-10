import React from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const courses = [
    { id: 1, name: 'Curso 1', price: '$10', progress: 2 },
    { id: 2, name: 'Curso 2', price: '$10', progress: 2 },
    { id: 3, name: 'Curso 3', price: '$10', progress: 2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <p className="text-gray-600 text-sm mb-1">Hola de nuevo</p>
          <h1 className="text-2xl font-bold text-blue-500 uppercase">USUARIO</h1>
        </div>

        {/* Recent Courses Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Tus últimos cursos</h2>
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {courses.map((course) => (
                <div key={course.id} className="w-40 border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
                  <div className="font-semibold text-sm mb-1">
                    {course.name} {course.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    Completado el {course.progress}% restante
                  </div>
                </div>
              ))}
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
