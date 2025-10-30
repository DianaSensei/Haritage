export const parsePriceToCents = (priceLabel: string | undefined | null): number => {
  if (!priceLabel) {
    return 0;
  }

  const normalized = priceLabel.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.round(parsed * 100);
};

export const formatPriceFromCents = (
  valueInCents: number,
  locale: string = 'en',
  currency: string = 'USD',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(valueInCents / 100);
