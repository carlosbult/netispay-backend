export interface BankResponse {
  success: boolean;
  data?: {
    referencia: string;
    codigoReverso: string;
    metadata: {
      codigoRespuesta: string;
      descripcionCliente: string;
      descripcionSistema: string;
      fechaHora: Date;
    };
  };
  errorData?: {
    codigoBanco: string;
    descripcionCliente: string;
    descripcionSistema: string;
    referencia?: string;
    rawResponse: any;
  };
}
