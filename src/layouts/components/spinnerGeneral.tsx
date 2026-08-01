import CircleLoader from "react-spinners/CircleLoader";
import { Transition } from '@headlessui/react'
import { useEffect, useState } from 'react';
export default function SpinnerGeneral() {
  const [isShowing, setIsShowing] = useState(false);
  useEffect(() => {
    setIsShowing(true);
  }, []);
  return (
    <>
     <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition show={isShowing}>
                        <div>
                            <div>
                                <CircleLoader
                                    color="#B08D3E" // asignarle el color del espiral
                                    loading
                                    size={70} // Aumenta el tamaño del espiral
                                    speedMultiplier={1.2} // Aumenta la velocidad del espiral
                                    cssOverride={{
                                        transform: "scale(2.5)",  // Aumenta el grosor del espiral
                                      }}
                                />
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </>
  )
}