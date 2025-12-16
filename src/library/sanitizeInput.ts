// library/sanitizeInput.ts
export const sanitizeText = (value: string): string => {
  const MAX_LENGTH = 500;
  
  let sanitized = value
    .replace(/[\x00-\x1F]/g, '')  // Elimina caracteres de control
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Truncar sin cortar en medio de una entidad HTML
  return sanitized.length > MAX_LENGTH 
    ? sanitized.slice(0, MAX_LENGTH).replace(/&[a-z]+$/, '') // Elimina entidad incompleta al final
    : sanitized;
};
  
 export const sanitizePassword = (value: string): string => {
    return value.replace(/[^\w!@#$%^&*()\-_+=<>?{}\[\].*+-ñ]/g, '');
};
  
  export const sanitizeEmail = (value: string): string => {
    return sanitizeText(value).toLowerCase().replace(/\s+/g, '');
  };
  
  export const sanitizeNumber = (value: string): string => {
    return value
      .replace(/[^-0-9.]/g, '')
      .replace(/(\..*)\./g, '$1')
      .replace(/(?!^)-/g, '');
  };

  export const sanitizeFilename = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9-_.]/g, '_') // Reemplazar caracteres no permitidos
      .replace(/\s+/g, '_') // Espacios a guiones bajos
      .substring(0, 255); // Limitar longitud
  };

  // Función para sanitizar valores de moneda
  export const sanitizeCurrency = (value: string): string => {
    // Permitir números, punto, coma y signo negativo
    let cleaned = value.replace(/[^\d.,-]/g, '');
    
    // Manejar múltiples puntos o comas - solo permitir uno
    const hasDecimal = cleaned.match(/[.,]/g);
    if (hasDecimal && hasDecimal.length > 1) {
      // Encontrar la primera ocurrencia de punto o coma
      const firstDecimalIndex = Math.min(
        cleaned.indexOf('.') !== -1 ? cleaned.indexOf('.') : Infinity,
        cleaned.indexOf(',') !== -1 ? cleaned.indexOf(',') : Infinity
      );
      
      // Mantener solo los caracteres antes del segundo decimal
      cleaned = cleaned.substring(0, firstDecimalIndex + 1) + 
                cleaned.substring(firstDecimalIndex + 1).replace(/[.,]/g, '');
    }
    
    // Reemplazar coma por punto para consistencia
    cleaned = cleaned.replace(/,/g, '.');
    
    // Limitar a dos decimales después del punto
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts[1].length > 2) {
        cleaned = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }
    
    return cleaned;
  };