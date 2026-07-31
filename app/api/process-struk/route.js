import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Proses OCR membaca teks pada foto
    const { data: { text } } = await Tesseract.recognize(buffer, 'ind');

    let rekap = {
      mobil: { jml: 0, total: 0 },
      motor: { jml: 0, total: 0 },
      lainnya: { jml: 0, total: 0 }
    };

    const lines = text.split('\n');

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      const match = cleanLine.match(/^([a-zA-Z\.\s]+?)\s+(\d+)\s+([\d\.\,]+)$/);

      if (match) {
        const nama = match[1].trim().toLowerCase();
        const jml = parseInt(match[2], 10);
        const total = parseInt(match[3].replace(/[^\d]/g, ''), 10);

        if (nama.includes('motor')) {
          rekap.motor.jml += jml;
          rekap.motor.total += total;
        } else if (nama.includes('mobil')) {
          rekap.mobil.jml += jml;
          rekap.mobil.total += total;
        } else {
          rekap.lainnya.jml += jml;
          rekap.lainnya.total += total;
        }
      }
    });

    const grandTotal = {
      unit: rekap.mobil.jml + rekap.motor.jml + rekap.lainnya.jml,
      pendapatan: rekap.mobil.total + rekap.motor.total + rekap.lainnya.total
    };

    return NextResponse.json({
      success: true,
      rawText: text,
      rekap,
      grandTotal
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}