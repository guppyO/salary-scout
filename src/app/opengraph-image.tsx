import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SalaryScout - Salary Data by Job & Location';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 40,
                    }}
                >
                    <svg
                        width="80"
                        height="80"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            width="32"
                            height="32"
                            rx="6"
                            fill="white"
                            fillOpacity="0.2"
                        />
                        <path
                            d="M8 22V14"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M14 22V10"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M20 22V16"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M26 22V8"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeOpacity="0.7"
                        />
                    </svg>
                    <span
                        style={{
                            marginLeft: 20,
                            fontSize: 64,
                            fontWeight: 700,
                            color: 'white',
                        }}
                    >
                        SalaryScout
                    </span>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: 36,
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: 60,
                    }}
                >
                    Salary Data by Job & Location
                </div>

                {/* Stats */}
                <div
                    style={{
                        display: 'flex',
                        gap: 60,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px 40px',
                            borderRadius: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 48,
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            800+
                        </span>
                        <span
                            style={{
                                fontSize: 20,
                                color: 'rgba(255, 255, 255, 0.8)',
                            }}
                        >
                            Occupations
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px 40px',
                            borderRadius: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 48,
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            390+
                        </span>
                        <span
                            style={{
                                fontSize: 20,
                                color: 'rgba(255, 255, 255, 0.8)',
                            }}
                        >
                            Metro Areas
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '20px 40px',
                            borderRadius: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 48,
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            138K+
                        </span>
                        <span
                            style={{
                                fontSize: 20,
                                color: 'rgba(255, 255, 255, 0.8)',
                            }}
                        >
                            Salary Pages
                        </span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
