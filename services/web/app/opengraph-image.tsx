import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hub Operacional — Software Percus';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a6ad8, #064a99)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: 2, opacity: 0.7 }}>
          SOFTWAREHOUSE • PERCUS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 100, fontWeight: 800, lineHeight: 1 }}>
            HUB<span style={{ color: 'rgba(255,255,255,0.5)' }}>.</span>OPERACIONAL
          </div>
          <div style={{ display: 'flex', fontSize: 32, opacity: 0.9 }}>
            Software pra operação que cresce
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, opacity: 0.6, fontFamily: 'monospace' }}>
          huboperacional.com.br
        </div>
      </div>
    ),
    { ...size },
  );
}
