// hooks/useInLogin.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthUser } from "../../../apis/login";
import type { TypeApiResponseToken } from "../../../types/login";
import { useState } from "react"; // 🔥 Agregar useState

export const userInLogin = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false); // 🔥 Estado para el modal
  const [modalMessage, setModalMessage] = useState(''); // 🔥 Mensaje del modal
  const [modalType, setModalType] = useState<'success' | 'error'>('error'); // 🔥 Tipo de modal

  const mutation = useMutation({
    mutationFn: AuthUser,
    onMutate: () => {
      // 🔥 Mostrar modal de "Cargando" al iniciar la mutación
      setModalMessage('Iniciando sesión...');
      setModalType('success'); // Puedes crear un tipo 'loading' si quieres
      setIsModalOpen(true);
    },
    onError: (error: Error) => {
      // 🔥 Mostrar modal de error
      setModalMessage(error.message || "Error desconocido");
      setModalType('error');
      // El modal ya está abierto desde onMutate, solo cambiamos el mensaje y tipo
    },
    onSuccess: (dataAPI: TypeApiResponseToken) => {
      if (dataAPI.result && dataAPI.content) {
        console.log('✅ Login exitoso, token recibido');
        // 🔥 Mostrar modal de éxito
        setModalMessage('¡Inicio de sesión exitoso!');
        setModalType('success');
        
        // Invalidar queries para forzar re-fetch de datos de usuario
        queryClient.invalidateQueries({ queryKey: ['userActive'] });
        
        // 🔥 Cerrar modal después de 2 segundos y redirigir
        setTimeout(() => {
          setIsModalOpen(false);
          // La redirección se manejará en el componente
        }, 2000);
      } else {
        // 🔥 Mostrar modal de error si result es false
        setModalMessage(dataAPI.error[0] || "Error en el login");
        setModalType('error');
      }
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    // 🔥 Si hay error, resetear la mutación para permitir reintento
    if (modalType === 'error') {
      mutation.reset();
    }
  };

  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    // 🔥 Exportar estados del modal
    modalState: {
      isOpen: isModalOpen,
      message: modalMessage,
      type: modalType,
      closeModal
    }
  };
};