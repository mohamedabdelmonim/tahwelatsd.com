const API_BASE = '/api/exchange-rates';

export interface ExchangeRates {
  base_code: string;
  rates: Record<string, number>;
}

export const currencyService = {
  async getRates(base: string): Promise<ExchangeRates | null> {
    try {
      const response = await fetch(`${API_BASE}/${base}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch exchange rates', error);
      return null;
    }
  },

  convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
    if (from === to) return amount;
    // Rates are relative to base. If base is not 'from', we convert to base first then to 'to'.
    // However our API gives rates FOR the base.
    // So if rates is from 'USD' base, and we want to convert USD to SDG: amount * rates['SDG']
    // If we want SDG to USD: amount / rates['SDG']
    return amount * rates[to];
  }
};
