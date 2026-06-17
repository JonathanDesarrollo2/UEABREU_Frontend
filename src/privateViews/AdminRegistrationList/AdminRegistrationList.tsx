import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaDownload, FaCheck, FaTrash } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";

const API_BASE = import.meta.env.VITE_API_URL || "https://appservices.ueabreu.com";

interface Application {
  id: string;
  planillaNumber: number;
  email: string;
  representativeName: string;
  userActive: boolean;
  createdAt: string;
}

const AdminRegistrationsList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<"activate" | "delete" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem("tokcattleraising_inCattleRanchCloud") || "";

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔍 [fetchApplications] Iniciando carga...");
      const res = await fetch(`${API_BASE}/api/private/registrations/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("📦 [fetchApplications] Respuesta:", data);
      if (data.result) {
        setApplications(data.content);
        console.log(`✅ [fetchApplications] Se cargaron ${data.content.length} solicitudes.`);
      } else {
        console.warn("⚠️ [fetchApplications] Error en respuesta:", data.error);
        toast.error(data.error?.[0] || "Error al cargar solicitudes");
      }
    } catch (error) {
      console.error("❌ [fetchApplications] Excepción:", error);
      toast.error("Error de conexión al cargar solicitudes");
    } finally {
      setLoading(false);
      console.log("🏁 [fetchApplications] Finalizado.");
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDownload = async (id: string) => {
    console.log(`⬇️ [handleDownload] Iniciando descarga para solicitud ${id}`);
    try {
      const url = `${API_BASE}/api/private/registrations/${id}/pdf`;
      console.log(`🌐 [handleDownload] URL: ${url}`);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`📡 [handleDownload] Estado de respuesta: ${res.status} ${res.statusText}`);
      console.log(`📋 [handleDownload] Headers:`, Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorData = await res.json();
        console.error("⚠️ [handleDownload] Error en respuesta:", errorData);
        toast.error(errorData.error?.[0] || "Error al obtener el PDF");
        return;
      }

      const contentType = res.headers.get("content-type");
      console.log(`📄 [handleDownload] Content-Type: ${contentType}`);

      const blob = await res.blob();
      console.log(`📊 [handleDownload] Tamaño del blob: ${blob.size} bytes`);
      console.log(`🔬 [handleDownload] Tipo del blob: ${blob.type}`);

      if (blob.size === 0) {
        console.error("🆘 [handleDownload] El blob está vacío (0 bytes).");
        toast.error("El PDF descargado está vacío.");
        return;
      }

      // Leer primeros bytes para ver si empieza por %PDF
      const reader = new FileReader();
      reader.onload = function () {
        const arr = new Uint8Array(reader.result as ArrayBuffer);
        const header = String.fromCharCode(...arr.slice(0, 5));
        console.log(`📖 [handleDownload] Primeros 5 bytes: "${header}"`);
        if (header !== "%PDF-") {
          console.error("🛑 [handleDownload] El archivo no es un PDF válido (falta cabecera %PDF).");
          toast.error("El archivo descargado no es un PDF válido.");
        } else {
          console.log("✅ [handleDownload] Cabecera PDF verificada, abriendo en nueva pestaña.");
        }
      };
      reader.readAsArrayBuffer(blob.slice(0, 5)); // solo los primeros bytes

      const urlBlob = URL.createObjectURL(blob);
      console.log(`🔗 [handleDownload] URL del blob creada: ${urlBlob}`);

      window.open(urlBlob, '_blank');
      console.log("🚀 [handleDownload] Nueva pestaña abierta con el PDF.");
    } catch (error) {
      console.error("🔥 [handleDownload] Excepción:", error);
      toast.error("Error de conexión al obtener el PDF");
    }
  };

  const handleActivate = (id: string) => {
    setSelectedId(id);
    setAction("activate");
    setShowConfirm(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setAction("delete");
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!selectedId || !action) return;
    console.log(`⚡ [confirmAction] Ejecutando ${action} sobre ${selectedId}`);
    try {
      const url =
        action === "activate"
          ? `${API_BASE}/api/private/registrations/${selectedId}/activate`
          : `${API_BASE}/api/private/registrations/${selectedId}`;
      const method = action === "activate" ? "POST" : "DELETE";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log("📦 [confirmAction] Respuesta:", data);
      if (data.result) {
        toast.success(data.content[0]);
        fetchApplications();
      } else {
        toast.error(data.error?.[0] || "Error al ejecutar acción");
      }
    } catch (error) {
      console.error("❌ [confirmAction] Excepción:", error);
      toast.error("Error de conexión");
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
      setAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setSelectedId(null);
    setAction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Solicitudes de Inscripción</h2>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-gray-500">No hay solicitudes registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">N° Planilla</th>
                <th className="py-2 px-3 text-left">Representante</th>
                <th className="py-2 px-3 text-left">Correo</th>
                <th className="py-2 px-3 text-left">Estado</th>
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{app.planillaNumber}</td>
                  <td className="py-2 px-3">{app.representativeName}</td>
                  <td className="py-2 px-3">{app.email}</td>
                  <td className="py-2 px-3">
                    {app.userActive ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">Pendiente</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDownload(app.id)}
                        className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        title="Descargar PDF"
                      >
                        <FaDownload />
                      </button>
                      {!app.userActive && (
                        <button
                          onClick={() => handleActivate(app.id)}
                          className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Activar cuenta"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Eliminar registro"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        onClose={cancelAction}
        onConfirm={confirmAction}
        title={action === "activate" ? "Activar Cuenta" : "Eliminar Registro"}
        message={
          action === "activate"
            ? "¿Estás seguro de que deseas activar esta cuenta? El representante podrá iniciar sesión."
            : "¿Estás seguro de que deseas eliminar completamente este registro? Se borrarán el usuario, representante, estudiantes y la planilla. Esta acción no se puede deshacer."
        }
      />
    </motion.div>
  );
};

export default AdminRegistrationsList;