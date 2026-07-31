'use client';
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setStatusText('Mempersiapkan gambar...');
    setResult(null);

    try {
      // 1. Jalankan OCR langsung di Browser dengan Indikator Persentase (%)
      const worker = await createWorker('ind', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setProgress(pct);
            setStatusText(`Membaca Teks: ${pct}%`);
          } else if (m.status === 'loading tesseract core') {
            setStatusText('Memuat Mesin OCR...');
            setProgress(10);
          } else if (m.status === 'initializing tesseract') {
            setStatusText('Inisialisasi Bahasa...');
            setProgress(20);
          }
        },
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setStatusText('Menghitung Rekapitulasi...');
      setProgress(95);

      // 2. Mengirim teks hasil OCR ke API backend untuk dihitung
      const res = await fetch('/api/process-struk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.success) {
        setProgress(100);
        setResult(data);
      } else {
        alert('Gagal memproses struk: ' + (data.error || 'Terjadi kesalahan.'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membaca foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>Pindai Struk Parkir</h1>
      <p style={{ textAlign: 'center', color: '#64748b', marginTop: 0, marginBottom: '24px', fontSize: '14px' }}>
        RSOP Ciamis - Rekapitulasi Otomatis
      </p>
      
      {/* Box Upload Foto & Progress Bar */}
      <div style={{ border: '2px dashed #0284c7', padding: '24px', textAlign: 'center', borderRadius: '12px', background: '#ffffff' }}>
        {!loading ? (
          <>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUpload} 
              id="fileInput"
              style={{ display: 'none' }}
            />
            <label htmlFor="fileInput" style={{ cursor: 'pointer', background: '#0284c7', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block' }}>
              📷 Ambil Foto / Upload Struk
            </label>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0284c7', fontSize: '15px' }}>
              ⏳ {statusText}
            </p>
            
            {/* Track Progress Bar */}
            <div style={{ width: '100%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Fill Progress Bar */}
              <div 
                style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  backgroundColor: '#0284c7', 
                  transition: 'width 0.3s ease',
                  borderRadius: '8px'
                }} 
              />
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '6px', fontWeight: 'bold' }}>
              {progress}% Selesai
            </span>
          </div>
        )}
      </div>

      {/* Tampilan Hasil Rekap */}
      {result && (
        <div style={{ marginTop: '30px', background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ borderBottom: '2px solid #0284c7', paddingBottom: '10px', color: '#0f172a', margin: 0, fontSize: '18px' }}>Hasil Rekap Otomatis</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
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
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase' }}>GRAND TOTAL HARI INI:</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
              <strong>{result.grandTotal.unit} Unit</strong> | <strong style={{ color: '#38bdf8' }}>Rp {result.grandTotal.pendapatan.toLocaleString('id-ID')}</strong>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}