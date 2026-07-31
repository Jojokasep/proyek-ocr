export const metadata = {
  title: 'Rekap Parkir RSOP Ciamis - Otomatis OCR',
  description: 'Hitung otomatis rekapitulasi struk parkir via foto',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}