// src/pages/representante/PaymentValidationPage.tsx
import { useParams } from 'react-router-dom';
import PaymentValidation from '../payment/paymentValidation';

export default function PaymentValidationPage() {
  const { representativeId } = useParams<{ representativeId: string }>();

  if (!representativeId) {
    return <div className="p-8 text-center text-red-600">ID de representante no proporcionado</div>;
  }

  return <PaymentValidation representativeId={representativeId} />;
}