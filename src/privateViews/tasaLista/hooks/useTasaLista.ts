// src/privateViews/tasaLista/hooks/useTasaLista.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createRateAPI,
  getRatesByMonthAPI,
  updateRateAPI,
  type ExchangeRateRecord,
} from "../../../apis/exchangeRate";

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
        // Añadimos el nuevo registro al estado local sin recargar todo el mes
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
  };
};