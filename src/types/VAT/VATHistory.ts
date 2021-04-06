import { VATRate } from "./VATRate"

export const VAT_HIGH = "Hoog"
export const VAT_LOW = "Laag"

export const VATHistory: Record<string, VATRate[]> = {
    "2019-01-01": [
        new VATRate(VAT_HIGH, 0.21),
        new VATRate(VAT_LOW, 0.09)
    ],
    "2012-10-01": [
        new VATRate(VAT_HIGH, 0.21),
        new VATRate(VAT_LOW, 0.06)
    ],
}