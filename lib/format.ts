const euroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEuro(amount: number): string {
  return euroFormatter.format(amount);
}

export interface PriceLabelInput {
  name: string;
  priceEur: number;
  priceFrom?: boolean;
}

export function packageOptionLabel(pkg: PriceLabelInput): string {
  const prefix = pkg.priceFrom ? "from " : "";
  return `${pkg.name} · ${prefix}${formatEuro(pkg.priceEur)}`;
}
