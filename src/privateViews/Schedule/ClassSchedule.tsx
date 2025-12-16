// views/ClassSchedule.tsx
import { useState } from 'react';
import { FaCalendarAlt, FaChalkboardTeacher, FaBook, FaClock, FaUsers } from 'react-icons/fa';

// Definición de tipos
interface ClassBlock {
  id: number;
  time: string;
  period: string;
}

interface Subject {
  id: number;
  name: string;
  teacher: string;
  blocks: number[];
}

interface DailySchedule {
  [day: string]: Subject[];
}

interface GradeSchedule {
  [section: string]: DailySchedule;
}

interface SchoolSchedule {
  [grade: string]: GradeSchedule;
}

export default function ClassSchedule() {
  // Estado para el año y sección seleccionados
  const [selectedGrade, setSelectedGrade] = useState('1ro');
  const [selectedSection, setSelectedSection] = useState('A');

  // Bloques de horario según tu especificación
  const timeBlocks: ClassBlock[] = [
    { id: 1, time: '7:00 - 7:40', period: 'Primer Horario' },
    { id: 2, time: '7:40 - 8:20', period: 'Segundo Horario' },
    { id: 3, time: '8:20 - 9:00', period: 'Tercer Horario' },
    { id: 4, time: '9:00 - 9:01', period: 'Cuarto Horario' },
    { id: 5, time: '10:00 - 10:20', period: 'Receso' },
    { id: 6, time: '10:20 - 10:40', period: 'Sexto Horario' },
    { id: 7, time: '10:40 - 11:20', period: 'Séptimo Horario' },
    { id: 8, time: '11:20 - 12:00', period: 'Octavo Horario' },
    { id: 9, time: '12:20 - 12:40', period: 'Noveno Horario' }
  ];

  // Datos de ejemplo completos - Horarios diferentes por año y sección
  const schoolSchedule: SchoolSchedule = {
    '1ro': {
      'A': {
        lunes: [
          { id: 1, name: 'Matemáticas I', teacher: 'Prof. María González', blocks: [1, 2] },
          { id: 2, name: 'Historia I', teacher: 'Prof. Carlos Rodríguez', blocks: [3, 4] },
          { id: 3, name: 'Ciencias I', teacher: 'Prof. Ana Martínez', blocks: [6, 7] },
          { id: 4, name: 'Literatura I', teacher: 'Prof. Luis Sánchez', blocks: [8, 9] }
        ],
        martes: [
          { id: 1, name: 'Física I', teacher: 'Prof. Roberto Díaz', blocks: [1, 2] },
          { id: 2, name: 'Química I', teacher: 'Prof. Elena Castro', blocks: [3, 4] },
          { id: 3, name: 'Biología I', teacher: 'Prof. Carmen Ruiz', blocks: [6, 7] },
          { id: 4, name: 'Geografía I', teacher: 'Prof. Javier López', blocks: [8, 9] }
        ],
        miercoles: [
          { id: 1, name: 'Inglés I', teacher: 'Prof. Patricia Mora', blocks: [1, 2] },
          { id: 2, name: 'Francés I', teacher: 'Prof. André Duval', blocks: [3, 4] },
          { id: 3, name: 'Arte I', teacher: 'Prof. Sofia Herrera', blocks: [6, 7] },
          { id: 4, name: 'Música I', teacher: 'Prof. Diego Campos', blocks: [8, 9] }
        ],
        jueves: [
          { id: 1, name: 'Educ. Física I', teacher: 'Prof. Miguel Ángel', blocks: [1, 2] },
          { id: 2, name: 'Deportes I', teacher: 'Prof. Carolina Vega', blocks: [3, 4] },
          { id: 3, name: 'Computación I', teacher: 'Prof. Ricardo Silva', blocks: [6, 7] },
          { id: 4, name: 'Programación I', teacher: 'Prof. Laura Mendoza', blocks: [8, 9] }
        ],
        viernes: [
          { id: 1, name: 'Filosofía I', teacher: 'Prof. Ernesto Pérez', blocks: [1, 2] },
          { id: 2, name: 'Ética I', teacher: 'Prof. Isabel Torres', blocks: [3, 4] },
          { id: 3, name: 'Psicología I', teacher: 'Prof. Rodrigo Ríos', blocks: [6, 7] },
          { id: 4, name: 'Sociología I', teacher: 'Prof. Claudia Núñez', blocks: [8, 9] }
        ]
      },
      'B': {
        lunes: [
          { id: 1, name: 'Matemáticas I', teacher: 'Prof. Laura Pérez', blocks: [1, 2] },
          { id: 2, name: 'Historia I', teacher: 'Prof. Roberto Sánchez', blocks: [3, 4] },
          { id: 3, name: 'Ciencias I', teacher: 'Prof. Marta López', blocks: [6, 7] },
          { id: 4, name: 'Literatura I', teacher: 'Prof. Carlos Mendoza', blocks: [8, 9] }
        ],
        // ... más días para 1ro B
      },
      'C': {
        lunes: [
          { id: 1, name: 'Matemáticas I', teacher: 'Prof. Ana García', blocks: [1, 2] },
          { id: 2, name: 'Historia I', teacher: 'Prof. Pedro Martínez', blocks: [3, 4] },
          { id: 3, name: 'Ciencias I', teacher: 'Prof. Sofía Rodríguez', blocks: [6, 7] },
          { id: 4, name: 'Literatura I', teacher: 'Prof. Juan Hernández', blocks: [8, 9] }
        ],
        // ... más días para 1ro C
      },
      'D': {
        lunes: [
          { id: 1, name: 'Matemáticas I', teacher: 'Prof. Miguel Torres', blocks: [1, 2] },
          { id: 2, name: 'Historia I', teacher: 'Prof. Elena Ramírez', blocks: [3, 4] },
          { id: 3, name: 'Ciencias I', teacher: 'Prof. David Castro', blocks: [6, 7] },
          { id: 4, name: 'Literatura I', teacher: 'Prof. Carmen Ortega', blocks: [8, 9] }
        ],
        // ... más días para 1ro D
      }
    },
    '2do': {
      'A': {
        lunes: [
          { id: 1, name: 'Matemáticas II', teacher: 'Prof. Ricardo Silva', blocks: [1, 2] },
          { id: 2, name: 'Historia II', teacher: 'Prof. Patricia López', blocks: [3, 4] },
          { id: 3, name: 'Física II', teacher: 'Prof. Andrés Mendoza', blocks: [6, 7] },
          { id: 4, name: 'Química II', teacher: 'Prof. Lucía Ramírez', blocks: [8, 9] }
        ],
        // ... más días para 2do A
      },
      'B': {
        lunes: [
          { id: 1, name: 'Matemáticas II', teacher: 'Prof. Fernando Cruz', blocks: [1, 2] },
          { id: 2, name: 'Historia II', teacher: 'Prof. Gabriela Soto', blocks: [3, 4] },
          { id: 3, name: 'Física II', teacher: 'Prof. Oscar Reyes', blocks: [6, 7] },
          { id: 4, name: 'Química II', teacher: 'Prof. Isabel Vargas', blocks: [8, 9] }
        ],
        // ... más días para 2do B
      },
      // ... secciones C y D para 2do
    },
    '3ro': {
      'A': {
        lunes: [
          { id: 1, name: 'Matemáticas III', teacher: 'Prof. Eduardo Rojas', blocks: [1, 2] },
          { id: 2, name: 'Historia III', teacher: 'Prof. Mariana Fuentes', blocks: [3, 4] },
          { id: 3, name: 'Biología III', teacher: 'Prof. Roberto Núñez', blocks: [6, 7] },
          { id: 4, name: 'Geografía III', teacher: 'Prof. Silvia Mora', blocks: [8, 9] }
        ],
        // ... más días para 3ro A
      },
      // ... más secciones para 3ro
    },
    '4to': {
      'A': {
        lunes: [
          { id: 1, name: 'Matemáticas IV', teacher: 'Prof. Alejandro Díaz', blocks: [1, 2] },
          { id: 2, name: 'Historia IV', teacher: 'Prof. Carolina Herrera', blocks: [3, 4] },
          { id: 3, name: 'Química IV', teacher: 'Prof. Jorge Paredes', blocks: [6, 7] },
          { id: 4, name: 'Física IV', teacher: 'Prof. Natalia Castro', blocks: [8, 9] }
        ],
        // ... más días para 4to A
      },
      // ... más secciones para 4to
    },
    '5to': {
      'A': {
        lunes: [
          { id: 1, name: 'Matemáticas V', teacher: 'Prof. Sergio Montes', blocks: [1, 2] },
          { id: 2, name: 'Historia V', teacher: 'Prof. Daniela Ríos', blocks: [3, 4] },
          { id: 3, name: 'Biología V', teacher: 'Prof. Hugo Salazar', blocks: [6, 7] },
          { id: 4, name: 'Química V', teacher: 'Prof. Verónica Toledo', blocks: [8, 9] }
        ],
        // ... más días para 5to A
      },
      // ... más secciones para 5to
    }
  };

  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const dayNames = {
    lunes: 'Lunes',
    martes: 'Martes', 
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes'
  };

  const grades = ['1ro', '2do', '3ro', '4to', '5to'];
  const sections = ['A', 'B', 'C', 'D'];

  // Obtener el horario actual seleccionado
  const currentSchedule = schoolSchedule[selectedGrade]?.[selectedSection] || schoolSchedule['1ro']['A'];

  // Función para encontrar la materia en un bloque específico
  const getSubjectInBlock = (day: string, blockId: number) => {
    return currentSchedule[day]?.find(subject => 
      subject.blocks.includes(blockId)
    );
  };

  // Función para determinar si es el primer bloque de una materia
  const isFirstBlock = (subject: Subject, blockId: number) => {
    return subject.blocks[0] === blockId;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FaCalendarAlt className="text-xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Horarios Escolares</h1>
                <p className="text-gray-600">Sistema de horarios por año y sección</p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-semibold">
                {selectedGrade} - Sección {selectedSection}
              </p>
            </div>
          </div>
        </div>

        {/* Selectores de Año y Sección */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de Año */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <FaUsers className="text-blue-500" />
                <span>Seleccionar Año</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade);
                      setSelectedSection('A'); // Reset a sección A al cambiar año
                    }}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      selectedGrade === grade
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Sección */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Seleccionar Sección
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sections.map(section => (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      selectedSection === section
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Sección {section}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Horarios */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-500" />
                    <span>Horario</span>
                  </div>
                </th>
                {days.map(day => (
                  <th key={day} className="px-4 py-3 text-center font-semibold text-gray-700 border-l border-gray-200">
                    {dayNames[day as keyof typeof dayNames]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeBlocks.map(block => {
                const isBreak = block.id === 5;
                
                return (
                  <tr key={block.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Columna de Horario */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          isBreak ? 'bg-orange-400' : 'bg-blue-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-800">{block.time}</p>
                          <p className="text-xs text-gray-500">{block.period}</p>
                        </div>
                      </div>
                    </td>

                    {/* Columnas de días */}
                    {days.map(day => {
                      const subject = getSubjectInBlock(day, block.id);
                      
                      if (isBreak) {
                        return (
                          <td key={day} className="px-4 py-3 text-center border-l border-gray-200" colSpan={1}>
                            <div className="bg-orange-50 border border-orange-100 rounded px-3 py-2">
                              <p className="text-orange-700 font-medium text-sm">RECESO</p>
                            </div>
                          </td>
                        );
                      }

                      if (subject && isFirstBlock(subject, block.id)) {
                        return (
                          <td key={day} className="px-4 py-3 border-l border-gray-200" rowSpan={2}>
                            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                              <div className="flex items-center space-x-2 mb-2">
                                <FaBook className="text-blue-500 text-sm" />
                                <h3 className="font-semibold text-blue-800">
                                  {subject.name}
                                </h3>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FaChalkboardTeacher className="text-gray-500 text-sm" />
                                <p className="text-gray-600 text-sm">
                                  {subject.teacher}
                                </p>
                              </div>
                            </div>
                          </td>
                        );
                      } else if (subject && !isFirstBlock(subject, block.id)) {
                        // Esta celda está cubierta por el rowSpan del primer bloque
                        return null;
                      } else {
                        return (
                          <td key={day} className="px-4 py-3 border-l border-gray-200">
                            <div className="text-center py-4">
                              <div className="text-gray-300">
                                <FaBook className="text-lg mx-auto mb-1" />
                                <p className="text-xs">Sin clase</p>
                              </div>
                            </div>
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Información */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span><strong>{selectedGrade} - Sección {selectedSection}</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Cada materia ocupa <strong>2 bloques consecutivos</strong></span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span><strong>Receso</strong> de 20 minutos a las 10:00</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Total de <strong>9 bloques</strong> académicos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resumen de Niveles */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {grades.map(grade => (
            <div 
              key={grade}
              className={`bg-white p-4 rounded-lg border text-center cursor-pointer transition-all ${
                selectedGrade === grade 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedSection('A');
              }}
            >
              <div className={`font-bold text-lg ${
                selectedGrade === grade ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {grade}
              </div>
              <div className="text-gray-500 text-sm">Año</div>
              <div className="text-xs text-gray-400 mt-1">4 secciones</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}