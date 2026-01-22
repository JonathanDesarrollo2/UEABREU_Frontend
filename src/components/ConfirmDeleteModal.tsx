import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import SpinnerGeneral from '../layouts/components/SpinnerGeneral';

interface ConfirmDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // ReactNode para permitir contenido dinámico
  isLoading?: boolean;
}
export default function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}: ConfirmDeleteModalProps) {
  const btnrojo =
    'bg-transparent text-red-500 font-semibold py-2 px-4 border border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const btngris =
    'bg-transparent text-gray-500 font-semibold py-2 px-4 border border-gray-500 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const cancelButtonRef = useRef(null);
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"  
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform-gpu origin-center overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl p-8">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-xl text-gray-500">{message}</p>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    className={btngris}
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={btnrojo}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <SpinnerGeneral/>
                        Eliminando...
                      </div>
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}