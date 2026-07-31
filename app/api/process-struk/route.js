import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Teks tidak ditemukan' }, { status: 400 });
    }

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
      rekap,
      grandTotal
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}