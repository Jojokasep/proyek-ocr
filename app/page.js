'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/process-struk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert('Gagal memproses struk: ' + (data.error || 'Terjadi kesalahan OCR.'));
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0f172a' }}>Pindai Struk Parkir</h1>
      
      {/* Input Upload Foto */}
      <div style={{ border: '2px dashed #0284c7', padding: '30px', textAlign: 'center', borderRadius: '12px', background: '#ffffff' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload} 
          disabled={loading}
          id="fileInput"
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" style={{ cursor: 'pointer', background: '#0284c7', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block' }}>
          {loading ? '⏳ Sedang Memproses Foto...' : '📷 Ambil Foto / Upload Struk'}
        </label>
      </div>

      {/* Tampilan Hasil Rekap */}
      {result && (
        <div style={{ marginTop: '30px', background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ borderBottom: '2px solid #0284c7', paddingBottom: '10px', color: '#0f172a', margin: 0 }}>Hasil Rekap Otomatis</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Kategori</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Jumlah</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>🚗 Mobil</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{result.rekap.mobil.jml} Unit</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Rp {result.rekap.mobil.total.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>🛵 Motor</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{result.rekap.motor.jml} Unit</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Rp {result.rekap.motor.total.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>🚐 Lainnya</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{result.rekap.lainnya.jml} Unit</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>Rp {result.rekap.lainnya.total.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '20px', background: '#0f172a', color: '#fff', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '14px', textTransform: 'uppercase' }}>GRAND TOTAL HARI INI:</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
              <strong>{result.grandTotal.unit} Unit</strong> | <strong style={{ color: '#38bdf8' }}>Rp {result.grandTotal.pendapatan.toLocaleString('id-ID')}</strong>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}