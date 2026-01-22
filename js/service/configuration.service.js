const APIPAY_URL = 'http://127.0.0.1:8080/api/PaymentMethod';

export let getPaymentMethods = async () => {
    try {
        const request = await fetch(`${APIPAY_URL}/getPaymentMethod`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de metodos de pago. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getPaymentMethods:", error);
        throw new Error("Fallo al conectar con el servicio de metodos de pago.");
    }
};