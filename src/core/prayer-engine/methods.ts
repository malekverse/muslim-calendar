import { CalculationMethod, type CalculationParameters } from 'adhan'

export const METHOD_KEYS = [
  'muslimWorldLeague',
  'egyptian',
  'karachi',
  'ummAlQura',
  'dubai',
  'moonsightingCommittee',
  'northAmerica',
  'kuwait',
  'qatar',
  'singapore',
  'turkey',
  'tehran',
] as const

export type MethodKey = (typeof METHOD_KEYS)[number]

const RESOLVERS: Record<MethodKey, () => CalculationParameters> = {
  muslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  egyptian: CalculationMethod.Egyptian,
  karachi: CalculationMethod.Karachi,
  ummAlQura: CalculationMethod.UmmAlQura,
  dubai: CalculationMethod.Dubai,
  moonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  northAmerica: CalculationMethod.NorthAmerica,
  kuwait: CalculationMethod.Kuwait,
  qatar: CalculationMethod.Qatar,
  singapore: CalculationMethod.Singapore,
  turkey: CalculationMethod.Turkey,
  tehran: CalculationMethod.Tehran,
}

export function resolveParameters(method: MethodKey): CalculationParameters {
  return RESOLVERS[method]()
}
