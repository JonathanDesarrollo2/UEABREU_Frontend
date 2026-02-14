import type { 
  UseFormRegister, 
  Path, 
  FieldError, 
  FieldValues,
  RegisterOptions,
  UseFormWatch
} from "react-hook-form";
import React from "react";
import { 
  sanitizeText, 
  sanitizePassword, 
  sanitizeEmail,
  sanitizeNumber, 
  sanitizeFilename,
  sanitizeCurrency
} from '../library/sanitizeInput';

type InputType = "text" | "date" | "email" | "password" | "number" | "checkbox" | "select" | "hidden" | "boolean" | "file" | "currency";

interface BaseFormFieldProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type?: InputType;
  required?: boolean;
  register: UseFormRegister<T>;
  watch?: UseFormWatch<T>;
  error?: FieldError;
  validation?: RegisterOptions<T, Path<T>>;
  hide?: boolean;
  defaultValue?: string | number | boolean | Date;
  readonly?: boolean;
  options?: Array<{ value: string; text: string }>;
  accept?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type FormFieldProps<T extends FieldValues> = BaseFormFieldProps<T> & (
  | { type: 'select'; options: Array<{ value: string; text: string }> }
  | { type: 'boolean'; options?: never }
  | { type?: Exclude<InputType, 'select' | 'boolean'> }
);

export const FormField = React.memo(
<T extends FieldValues>(props: FormFieldProps<T>): React.JSX.Element => {
  const { 
    id, 
    label, 
    type = "text", 
    required = false, 
    register, 
    error, 
    validation, 
    hide = false,
    defaultValue,
    readonly = false,
    options
  } = props;

  const getFormattedValue = (): string | number => {
    if (defaultValue === undefined || defaultValue === null) return '';
    
    if (type === 'date') {
      if (defaultValue instanceof Date) {
        return defaultValue.toISOString().split('T')[0];
      }
      if (typeof defaultValue === 'string') {
        try {
          return new Date(defaultValue).toISOString().split('T')[0];
        } catch {
          return '';
        }
      }
    }
    
    if (type === 'select' && options) {
      const stringValue = defaultValue.toString();
      return options.some(opt => opt.value === stringValue) ? stringValue : '';
    }

    if (typeof defaultValue === 'string') {
      switch (type) {
        case 'text': return sanitizeText(defaultValue);
        case 'email': return sanitizeEmail(defaultValue);
        case 'password': return sanitizePassword(defaultValue);
        case 'number': return sanitizeNumber(defaultValue);
        case 'currency': return sanitizeCurrency(defaultValue);
      }
    }
    
    return defaultValue.toString();
  };

  const formattedValue = React.useMemo(
    () => getFormattedValue(),
    [defaultValue, type, options]
  );

  const secureRegister = (
    name: Path<T>, 
    options?: RegisterOptions<T, Path<T>>
  ) => {
    const { onChange, ...rest } = register(name, {
      ...options,
      setValueAs: (value) => {
        if (type === 'number') return Number(value);
        if (type === 'currency') {
          // Convertir a número y asegurar máximo 2 decimales
          const numValue = Number(value);
          return isNaN(numValue) ? value : Number(numValue.toFixed(2));
        }
        return value;
      }
    });
    
    return {
      ...rest,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        switch (type) {
          case 'text':
            value = sanitizeText(value);
            break;
            
          case 'email':
            value = sanitizeEmail(value);
            break;
            
          case 'password':
            value = sanitizePassword(value);
            break;
            
          case 'number':
            value = sanitizeNumber(value);
            break;
          case 'file':
            value = sanitizeFilename(value);
            break;
          case 'currency':
            value = sanitizeCurrency(value);
            break;
        }
        e.target.value = value;
        onChange(e);
      }
    };
  };

  if (hide || type === 'hidden') {
    return (
      <input
        type="hidden"
        id={id}
        {...register(id, {
          required: required ? "Este campo es requerido" : false,
          ...validation
        })}
        value={formattedValue}
      />
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="flex flex-col mb-2">
        <label htmlFor={id} className="text-gray-700 font-bold mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="checkbox"
          id={id}
          {...register(id, {
            required: required ? "Este campo es requerido" : false,
            ...validation
          })}
          defaultChecked={Boolean(defaultValue)}
          className={`h-5 w-5 text-blue-600 rounded focus:ring-blue-500 ${
            readonly ? 'opacity-50 cursor-not-allowed' : ''
          } relative`}
          disabled={readonly}
        />
        
        {error && (
          <span className="text-red-500 text-sm mt-1">{error.message}</span>
        )}
      </div>
    );
  }

if (type === 'select') {
  return (
    <div className="flex flex-col mb-2">
      <label htmlFor={id} className="text-gray-700 font-bold mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        {...register(id, {
          required: required ? "Este campo es requerido" : false,
          ...validation,
          // ✅ NO convertir a número, dejar el string original
          setValueAs: (value) => value === "" ? undefined : value
        })}
        className={`w-full px-3 py-2 border-2 border-solid ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
          readonly ? "bg-gray-100 cursor-not-allowed" : ""
        } relative`}
        disabled={readonly}
        defaultValue={formattedValue}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === ""}> 
            {option.text}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-red-500 text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
}

  if (type === 'boolean') {
    const [currentValue, setCurrentValue] = React.useState<boolean>(Boolean(defaultValue));
    
    const booleanOptions = [
      { value: "true", text: "Activo" },
      { value: "false", text: "Inactivo" }
    ];
  
    React.useEffect(() => {
      setCurrentValue(Boolean(defaultValue));
    }, [defaultValue]);
  
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentValue(e.target.value === "true");
    };
  
    const selectColorClass = currentValue ? "text-green-500" : "text-red-500";
  
    return (
      <div className="flex flex-col mb-2">
        <label htmlFor={id} className="text-gray-700 font-bold mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            id={id}
            {...register(id, {
              required: required ? "Este campo es requerido" : false,
              setValueAs: (value) => value === "true",
              ...validation,
              onChange: handleChange
            })}
            className={`w-full px-3 py-2 border-2 border-solid ${
              error ? "border-red-400" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
              readonly ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${selectColorClass} relative`}
            disabled={readonly}
            defaultValue={currentValue.toString()}
          >
            {booleanOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className={option.value === "true" ? "text-green-400" : "text-red-400"}
              >
                {option.text}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error.message}</span>
        )}
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className="flex flex-col mb-2">
        <label htmlFor={id} className="text-gray-700 font-bold mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="file"
          id={id}
          accept={props.accept}
          {...register(id, {
            required: required ? "Este campo es requerido" : false,
            ...validation
          })}
          onChange={props.onChange}
          className={`w-full px-3 py-2 border-2 border-solid ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
            readonly ? 'bg-gray-100 cursor-not-allowed' : ''
          } relative`}
          disabled={readonly}
        />
        {error && (
          <span className="text-red-500 text-sm mt-1">{error.message}</span>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col mb-2">
      <label htmlFor={id} className="text-gray-700 font-bold mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type === 'currency' ? 'text' : type} // currency usa tipo text pero con formato especial
        id={id}
        {...secureRegister(id, {
          required: required ? "Este campo es requerido" : false,
          ...validation
        })}
        defaultValue={formattedValue}
        className={`w-full px-3 py-2 border-2 border-solid ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:ring focus:border-blue-300 ${
          readonly ? 'bg-gray-100 cursor-not-allowed' : ''
        } relative`}
        readOnly={readonly}
        // Para currency, agregar un placeholder que indique el formato
        placeholder={type === 'currency' ? "0.00" : undefined}
      />
      {error && (
        <span className="text-red-500 text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
},
(prevProps, nextProps) => (
  prevProps.register === nextProps.register &&
  JSON.stringify(prevProps.validation) === JSON.stringify(nextProps.validation) &&
  prevProps.defaultValue === nextProps.defaultValue &&
  prevProps.error?.message === nextProps.error?.message &&
  prevProps.hide === nextProps.hide &&
  prevProps.readonly === nextProps.readonly &&
  prevProps.type === nextProps.type &&
  JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
)) as <T extends FieldValues>(props: FormFieldProps<T>) => React.JSX.Element;