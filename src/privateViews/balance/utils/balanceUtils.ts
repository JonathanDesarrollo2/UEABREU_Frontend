// Utilidades compartidas: formato de moneda, colores según saldo, validación UUID, mapeo de métodos de pago
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getBalanceColor = (balance: number): string => {
  if (balance < 0) return 'text-red-600';
  if (balance > 0) return 'text-green-600';
  return 'text-gray-600';
};

export const getBalanceBgColor = (balance: number): string => {
  if (balance < 0) return 'bg-red-100 text-red-800';
  if (balance > 0) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

export const isValidUUID = (uuid: string | null): boolean => {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

export const mapPaymentMethodToDisplay = (method: string): string => {
  const map: Record<string, string> = {
    'cash': 'Efectivo',
    'bank_transfer': 'Transferencia Bancaria',
    'debit_card': 'Tarjeta de Débito',
    'credit_card': 'Tarjeta de Crédito',
    'pago_movil': 'Pago Móvil',
    'check': 'Cheque'
  };
  return map[method] || method;
};