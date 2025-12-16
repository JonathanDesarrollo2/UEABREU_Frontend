export default function Spinner() {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-600">Verificando autenticación...</p>
    </div>
  );
}