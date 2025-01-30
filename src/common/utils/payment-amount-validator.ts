interface PaymentValidationDto {
  userId: number;
  bankCode: string;
  productType: string;
  expectedAmount: number;
  allowPartialPayment: boolean;
  paymentData: {
    startTime: string;
    endTime: string;
    orderId: string;
    amount: number;
    currency: string;
    exchangeRate: number;
  };
  invoices: {
    id: string;
    amount: number;
  }[];
}

interface ValidationResult {
  isValid: boolean;
  networkAmount: number;
  difference: number;
  message?: string;
  amountUSD: number;
  adjustedInvoices: {
    id: string;
    amount: number;
    adjustedAmount: number;
  }[];
}

export async function validatePaymentAmount(
  data: PaymentValidationDto,
): Promise<ValidationResult> {
  // Convertir montos a USD si es necesario
  let receivedAmountUSD = data.paymentData.amount;
  let expectedAmountUSD = data.expectedAmount;

  if (data.paymentData.currency === 'VES') {
    const rate = data.paymentData.exchangeRate;
    receivedAmountUSD = data.paymentData.amount / rate;
    expectedAmountUSD = data.expectedAmount / rate;
  }

  // Calcular el monto total de las facturas
  const totalInvoicesAmount = data.invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );

  // Calcular la diferencia entre el monto recibido y el esperado
  const difference = Number((receivedAmountUSD - expectedAmountUSD).toFixed(2));

  // Si el monto recibido es menor y no se permiten pagos parciales
  if (difference < 0 && !data.allowPartialPayment) {
    return {
      isValid: false,
      networkAmount: 0,
      difference,
      message: 'No se permiten pagos parciales',
      amountUSD: receivedAmountUSD,
      adjustedInvoices: data.invoices.map((invoice) => ({
        ...invoice,
        adjustedAmount: 0,
      })),
    };
  }

  // Distribuir la diferencia proporcionalmente entre las facturas
  const adjustedInvoices = data.invoices.map((invoice) => {
    const proportion = invoice.amount / totalInvoicesAmount;
    const adjustment = difference * proportion;
    return {
      id: invoice.id,
      amount: invoice.amount,
      adjustedAmount: Number((invoice.amount + adjustment).toFixed(2)),
    };
  });

  // Ajustar el monto a registrar en el administrador de red
  let networkAmount = totalInvoicesAmount;
  if (difference !== 0) {
    networkAmount = Number((networkAmount + difference).toFixed(2));
  }

  return {
    isValid: true,
    networkAmount,
    difference,
    amountUSD: receivedAmountUSD,
    adjustedInvoices,
  };
}
