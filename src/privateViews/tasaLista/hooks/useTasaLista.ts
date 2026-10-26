import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createRateAPI,
  getRatesByMonthAPI,
  updateRateAPI,
  type ExchangeRateRecord,
} from "../../../apis/exchangeRate";
import api from "../../../library/axios"; // ⬅️ IMPORTANTE: Asegúrate de que esta ruta sea correcta

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const useTasaLista = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [rates, setRates] = useState<ExchangeRateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false); // ⬅️ NUEVO estado
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRatesByMonthAPI(year, month);
      if (res.result && Array.isArray(res.content)) {
        setRates(res.content);
      } else {
        setRates([]);
      }
    } catch (err: any) {
      setError(err?.message || "Error al cargar las tasas");
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const ratesByDate = useMemo(() => {
    const map: Record<string, ExchangeRateRecord> = {};
    rates.forEach((r) => {
      if (r.effectiveDate) map[r.effectiveDate] = r;
    });
    return map;
  }, [rates]);

  const goPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const updateRate = async (id: string, rate: number): Promise<boolean> => {
    try {
      const res = await updateRateAPI(id, rate);
      if (res.result && res.content) {
        setRates((prev) =>
          prev.map((r) => (r.id === id ? { ...r, rate: res.content.rate } : r))
        );
        toast.success("Tasa actualizada correctamente");
        return true;
      }
      toast.error(res.error?.[0] || "Error al actualizar la tasa");
      return false;
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar la tasa");
      return false;
    }
  };

  const createRate = async (effectiveDate: string, rate: number): Promise<boolean> => {
    try {
      const res = await createRateAPI(effectiveDate, rate);
      if (res.result && res.content) {
        setRates((prev) => {
          const next = [...prev, res.content];
          next.sort((a, b) => (a.effectiveDate < b.effectiveDate ? -1 : 1));
          return next;
        });
        toast.success("Tasa agregada correctamente");
        return true;
      }
      toast.error(res.error?.[0] || "Error al agregar la tasa");
      return false;
    } catch (err: any) {
      toast.error(err?.message || "Error al agregar la tasa");
      return false;
    }
  };

  // ⬇️ NUEVO MÉTODO PARA SINCRONIZAR CON EL BANCO ⬇️
  const syncToday = async (): Promise<boolean> => {
    setSyncing(true);
    try {
      const res = await api.post('/private/rates/sync-today');
      if (res.data.result) {
        toast.success(`Tasa de hoy sincronizada: ${res.data.content.rate} Bs/USD`);
        await loadRates(); // Recargar la tabla para que aparezca en pantalla
        return true;
      } else {
        toast.error(res.data.error?.[0] || "Error al sincronizar la tasa");
        return false;
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error?.[0] || 
        err.message || 
        "Error al conectar con el banco"
      );
      return false;
    } finally {
      setSyncing(false);
    }
  };

  return {
    year, month,
    setYear, setMonth,
    goPrevMonth, goNextMonth,
    ratesByDate,
    loading,
    error,
    updateRate,
    createRate,
    reload: loadRates,
    syncToday, // ⬅️ Exportamos el método
    syncing,   // ⬅️ Exportamos el estado de carga
  };
};