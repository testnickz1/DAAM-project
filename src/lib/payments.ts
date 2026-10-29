// Платёжный слой. Сейчас — demo. Для боевого режима реализуйте createPayment()
// под выбранный банк/агрегатор и обработку его вебхука в /api/payment/webhook.

export const isDemoPayments = () => (process.env.PAYMENT_PROVIDER ?? 'demo') === 'demo';

export async function createPayment(o: { orderId: string; number: string; amount: number; method: 'card' | 'qr' }): Promise<{ redirectUrl: string }> {
  if (isDemoPayments()) return { redirectUrl: `/order/${o.orderId}` };
  // TODO: запрос к провайдеру → вернуть URL платёжной формы (card) или страницу заказа с QR (qr).
  throw new Error(`Платёжный провайдер "${process.env.PAYMENT_PROVIDER}" не реализован`);
}
