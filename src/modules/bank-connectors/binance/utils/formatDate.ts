export const formatDateParams = (params: {
  startTime?: string;
  endTime?: string;
}) => {
  const formattedParams: {
    startTime?: number;
    endTime?: number;
    timestamp: number;
  } = {
    timestamp: Date.now(),
  };

  if (params.startTime) {
    const startDate = new Date(params.startTime);
    startDate.setHours(0, 0, 0, 0);
    formattedParams.startTime = startDate.getTime();
  }

  if (params.endTime) {
    const endDate = new Date(params.endTime);
    endDate.setHours(23, 59, 59, 999);
    formattedParams.endTime = endDate.getTime();
  }

  return formattedParams;
};
