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
        <div className="text-center mb-4">
          <img src="/logo.png" alt="Logo" className="mx-auto h-20 mb-2" />
          <h1 className="text-xl font-bold">PLANILLA DE SOLICITUD DE INSCRIPCIÓN</h1>
          <p className="text-sm">U.E. José Antonio Abreu - Naguanagua</p>
          <p className="text-sm"><strong>N° de Planilla:</strong> {planillaNumber ?? '—'}</p>
          <p className="text-sm">Fecha: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex flex-row gap-4">
          {/* Representante */}
          <div className="flex-1 avoid-break">
            <h3 className="font-bold underline mb-2">1. DATOS DEL REPRESENTANTE</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-semibold pr-2">Nombre y Apellido:</td><td>{data.representativeFullName}</td></tr>
                <tr><td className="font-semibold pr-2">Cédula de Identidad:</td><td>{data.representativeIdentityCard}</td></tr>
                <tr><td className="font-semibold pr-2">Dirección:</td><td>{data.representativeAddress}</td></tr>
                <tr><td className="font-semibold pr-2">Teléfono:</td><td>{data.representativePhone}</td></tr>
                <tr><td className="font-semibold pr-2">Relación con el estudiante:</td><td>{data.relationship}</td></tr>
                <tr><td className="font-semibold pr-2">Nombre del Padre/Madre:</td><td>{data.parentName || '-'}</td></tr>
                <tr><td className="font-semibold pr-2">Cédula Padre/Madre:</td><td>{data.parentIdentityCard || '-'}</td></tr>
                <tr><td className="font-semibold pr-2">Teléfono Padre/Madre:</td><td>{data.parentPhone || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Solicitantes */}
          <div className="flex-1 avoid-break">
            <h3 className="font-bold underline mb-2">2. DATOS DE LOS SOLICITANTES</h3>
            {data.students.map((est, idx) => (
              <div key={idx} className="mb-2 avoid-break">
                <p className="font-semibold text-sm">Solicitante {idx + 1}</p>
                <table className="w-full text-xs">
                  <tbody>
                    <tr><td className="font-semibold pr-2">Nombre:</td><td>{est.fullName}</td></tr>
                    <tr><td className="font-semibold pr-2">Edad:</td><td>{calcularEdad(est.birthDate)}</td></tr>
                    <tr><td className="font-semibold pr-2">Fecha Nac.:</td><td>{est.birthDate}</td></tr>
                    <tr><td className="font-semibold pr-2">Nacionalidad:</td><td>{est.nationality}</td></tr>
                    <tr><td className="font-semibold pr-2">País Nac.:</td><td>{est.birthCountry}</td></tr>
                    <tr><td className="font-semibold pr-2">Estado:</td><td>{est.state}</td></tr>
                    <tr><td className="font-semibold pr-2">Zona donde vive:</td><td>{est.zone}</td></tr>
                    <tr><td className="font-semibold pr-2">Municipio:</td><td>{est.municipality || '-'}</td></tr>
                    <tr><td className="font-semibold pr-2">Escuela de procedencia:</td><td>{est.previousSchool || '-'}</td></tr>
                    <tr><td className="font-semibold pr-2">Año que aspira:</td><td>{est.aspiredGrade}</td></tr>
                    <tr><td className="font-semibold pr-2">Dirección:</td><td>{est.addressDescription}</td></tr>
                    <tr><td className="font-semibold pr-2">Teléfono:</td><td>{est.phone || '-'}</td></tr>
                    <tr><td className="font-semibold pr-2">Emergencia:</td><td>{est.emergencyContact}</td></tr>
                    <tr><td className="font-semibold pr-2">Tel. Emerg.:</td><td>{est.emergencyPhone}</td></tr>
                    <tr><td className="font-semibold pr-2">Alergias:</td><td>{est.hasAllergies ? est.allergiesDescription : 'No'}</td></tr>
                    <tr><td className="font-semibold pr-2">Enfermedades:</td><td>{est.hasDiseases ? est.diseasesDescription : 'No'}</td></tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Firmas y nota */}
        <div className="mt-8 avoid-break">
          <p className="text-sm mb-2 font-bold">Para uso del representante:</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p>_________________________</p>
              <p>Firma del Representante</p>
            </div>
            <div>
              <p>_________________________</p>
              <p>Firma de quien recibe</p>
            </div>
            <div>
              <p>_________________________</p>
              <p>Sello</p>
            </div>
            <div>
              <p>Fecha y hora: _______________</p>
              <p>(Solo uso de la institución)</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-semibold mt-6 avoid-break border-t pt-2">
          Nota: Esta planilla no da derecho a aprobación de cupo solamente, es un proceso de preinscripción.
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
