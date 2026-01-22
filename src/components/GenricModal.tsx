import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface Field {
  label: string;
  value: string | number | boolean;
  type?: 'text' | 'boolean' | 'number' | 'hidden';
}

interface GenericModalProps {
  title: string;
  fields: Field[];
  onClose: () => void;
  show: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  extraContent?: React.ReactNode;
}
export default function GenericModal({
  title,
  fields,
  onClose,
  show,
  onEdit,
  onDelete,
  onCancel,
  extraContent,
}: GenericModalProps) {
  const btnazul =
    "bg-transparent text-blue-500 font-semibold py-2 px-4 border border-blue-500 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnrojo =
    "bg-transparent text-red-500 font-semibold py-2 px-4 border border-red-500 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btngris =
    "bg-transparent text-gray-500 font-semibold py-2 px-4 border border-gray-500 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all p-8">
                <button
                  type="button"
                  className="absolute top-4 right-4 bg-transparent text-gray-500 font-semibold p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  onClick={onClose}
                >
                  ✕
                </button>

                <Dialog.Title as="h3" className="font-black text-4xl my-5">
                  {title}
                </Dialog.Title>

                {extraContent && (
                  <div className="mb-4">
                    {extraContent}
                  </div>
                )}
                {fields.map(
                  (field, index) =>
                    field.type !== 'hidden' && (
                      <p key={index} className="text-2xl font-bold">
                        {field.label}:{' '}
                        <span className="text-fuchsia-600">
                          {field.type === 'boolean' ? (field.value ? 'Sí' : 'No') : field.value}
                        </span>
                      </p>
                    )
                )}
                <div className="mt-8 flex justify-start space-x-4">
                  <button type="button" className={btnazul} onClick={onEdit}>
                    Editar
                  </button>
                  <button type="button" className={btnrojo} onClick={onDelete}>
                    Eliminar
                  </button>
                  <button type="button" className={btngris} onClick={onCancel}>
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
