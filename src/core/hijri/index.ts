const HIJRI_FORMATTER = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** Formats a Gregorian date as Hijri, applying the user's manual moon-sighting offset. */
export function formatHijri(date: Date, offsetDays: number): string {
  const shifted = new Date(date.getTime() + offsetDays * 86_400_000)
  return HIJRI_FORMATTER.format(shifted)
}
