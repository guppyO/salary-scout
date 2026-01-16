import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#2563eb',
                    borderRadius: 6,
                }}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 18V12"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10 18V8"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M14 18V14"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M18 18V6"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeOpacity="0.7"
                    />
                </svg>
            </div>
        ),
        { ...size }
    );
}
