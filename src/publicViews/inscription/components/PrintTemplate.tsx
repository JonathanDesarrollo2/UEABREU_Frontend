import React from 'react';
import type { InscripcionFormData } from '../../../types/inscripcion';

interface Props {
  data: InscripcionFormData | null;
  planillaNumber: number | null;
  calcularEdad: (fecha: string) => number | string;
}

const PrintTemplate: React.FC<Props> = ({ data, planillaNumber, calcularEdad }) => {
  if (!data) return null;

  return (
    <div id="print-area" className="hidden print:block text-left mx-auto max-w-full">
      <div className="avoid-break">
        {/* Encabezado compacto */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="Logo" className="mx-auto h-12 mb-1" />
          <h1 className="text-base font-bold">PLANILLA DE SOLICITUD DE INSCRIPCIÓN</h1>
          <p className="text-xs">U.E. José Antonio Abreu - Naguanagua</p>
          <p className="text-xs">
            <strong>N° de Planilla:</strong> {planillaNumber ?? '—'} &nbsp;|&nbsp;
            <strong>Fecha:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Contenido en dos columnas */}
        <div className="flex flex-row gap-4">
          {/* Representante */}
          <div className="flex-1 avoid-break">
            <h3 className="font-bold underline mb-1 text-xs">1. DATOS DEL REPRESENTANTE</h3>
            <table className="w-full text-[8px] border-collapse">
              <tbody>
                <tr><td className="font-semibold pr-1">Nombre y Apellido:</td><td>{data.representativeFullName}</td></tr>
                <tr><td className="font-semibold pr-1">Cédula de Identidad:</td><td>{data.representativeIdentityCard}</td></tr>
                <tr><td className="font-semibold pr-1">Dirección:</td><td>{data.representativeAddress}</td></tr>
                <tr><td className="font-semibold pr-1">Teléfono:</td><td>{data.representativePhone}</td></tr>
                <tr><td className="font-semibold pr-1">Relación con el estudiante:</td><td>{data.relationship}</td></tr>
                <tr><td className="font-semibold pr-1">Nombre del Padre/Madre:</td><td>{data.parentName || '-'}</td></tr>
                <tr><td className="font-semibold pr-1">Cédula Padre/Madre:</td><td>{data.parentIdentityCard || '-'}</td></tr>
                <tr><td className="font-semibold pr-1">Teléfono Padre/Madre:</td><td>{data.parentPhone || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Solicitantes */}
          <div className="flex-1 avoid-break">
            <h3 className="font-bold underline mb-1 text-xs">2. DATOS DE LOS SOLICITANTES</h3>
            {data.students.map((est, idx) => (
              <div key={idx} className="mb-1 avoid-break">
                <p className="font-semibold text-[8px]">Solicitante {idx + 1}</p>
                <table className="w-full text-[8px] border-collapse">
                  <tbody>
                    <tr><td className="font-semibold pr-1">Nombre:</td><td>{est.fullName}</td></tr>
                    <tr><td className="font-semibold pr-1">Edad:</td><td>{calcularEdad(est.birthDate)}</td></tr>
                    <tr><td className="font-semibold pr-1">Fecha Nac.:</td><td>{est.birthDate}</td></tr>
                    <tr><td className="font-semibold pr-1">Nacionalidad:</td><td>{est.nationality}</td></tr>
                    <tr><td className="font-semibold pr-1">País Nac.:</td><td>{est.birthCountry}</td></tr>
                    <tr><td className="font-semibold pr-1">Estado:</td><td>{est.state}</td></tr>
                    <tr><td className="font-semibold pr-1">Zona donde vive:</td><td>{est.zone}</td></tr>
                    <tr><td className="font-semibold pr-1">Municipio:</td><td>{est.municipality || '-'}</td></tr>
                    <tr><td className="font-semibold pr-1">Escuela de procedencia:</td><td>{est.previousSchool || '-'}</td></tr>
                    <tr><td className="font-semibold pr-1">Año que aspira:</td><td>{est.aspiredGrade}</td></tr>
                    <tr><td className="font-semibold pr-1">Dirección:</td><td>{est.addressDescription}</td></tr>
                    <tr><td className="font-semibold pr-1">Teléfono:</td><td>{est.phone || '-'}</td></tr>
                    <tr><td className="font-semibold pr-1">Emergencia:</td><td>{est.emergencyContact}</td></tr>
                    <tr><td className="font-semibold pr-1">Tel. Emerg.:</td><td>{est.emergencyPhone}</td></tr>
                    <tr><td className="font-semibold pr-1">Alergias:</td><td>{est.hasAllergies ? est.allergiesDescription : 'No'}</td></tr>
                    <tr><td className="font-semibold pr-1">Enfermedades:</td><td>{est.hasDiseases ? est.diseasesDescription : 'No'}</td></tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Firmas y nota al pie (muy compactas) */}
        <div className="mt-2 avoid-break">
          <p className="text-[8px] mb-1 font-bold">Para uso del representante:</p>
          <div className="grid grid-cols-4 gap-2 text-[8px]">
            <div>
              <p>_________________</p>
              <p>Firma del Representante</p>
            </div>
            <div>
              <p>_________________</p>
              <p>Firma de quien recibe</p>
            </div>
            <div>
              <p>_________________</p>
              <p>Sello</p>
            </div>
            <div>
              <p>Fecha y hora: ________</p>
              <p>(Uso interno)</p>
            </div>
          </div>
        </div>

        <div className="text-center text-[7px] font-semibold mt-1 avoid-break border-t pt-1 leading-tight">
          Nota: Esta planilla es solo una solicitud de preinscripción, no asegura ni garantiza un cupo definitivo. La aprobación está sujeta a disponibilidad y evaluación de la U.E. José Antonio Abreu.
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;