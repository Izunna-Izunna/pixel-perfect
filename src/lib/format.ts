export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }).format(value);
}

export function maskPhone(phone: string) {
  return phone.replace(/(\+44\s?\d)\d{6}(\d{3})/, "$1•• ••• $2");
}
