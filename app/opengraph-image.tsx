import { ImageResponse } from 'next/og';

export const alt = 'Fairy Finds Boutique | Women\'s Fashion Boutique in Kottayam, Kerala';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A1A',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Subtle decorative border */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(255, 85, 210, 0.35)',
            display: 'flex',
          }}
        />

        {/* Top Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#FF55D2',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          Kottayam, Kerala • All-India Shipping
        </div>

        {/* Brand Headline */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontFamily: 'serif',
            color: '#FFFFFF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          Fairy Finds Boutique
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            color: '#D4D4D4',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.5,
            marginBottom: '32px',
          }}
        >
          Ready-to-Wear Fashion & Custom Tailored Outfits
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          {['Dresses', 'Kurithis', 'Sarees', 'Custom Tailoring'].map((category) => (
            <div
              key={category}
              style={{
                display: 'flex',
                padding: '8px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
