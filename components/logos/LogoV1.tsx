interface Props {
  height?: number
  dark?: boolean
  className?: string
}

export default function LogoV1({ height = 80, dark = true, className }: Props) {
  const w = Math.round((240 / 96) * height)
  const gold  = dark ? '#C8A96E' : '#2A1A0A'
  const line  = dark ? '#C8A96E' : '#6B4E2A'

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 240 96"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Олійник Меблі"
      role="img"
    >
      {/* Top rules */}
      <line x1="20" y1="9"  x2="220" y2="9"  stroke={line} strokeWidth="0.5" opacity="0.3"/>
      <line x1="20" y1="12" x2="220" y2="12" stroke={line} strokeWidth="0.3" opacity="0.2"/>

      {/* Main wordmark */}
      <text
        x="120" y="54"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="37" fontWeight="900"
        fill={gold} textAnchor="middle" letterSpacing="5"
      >ОЛІЙНИК</text>

      {/* Ornament: line – dot – diamond – dot – line */}
      <line x1="30"  y1="64" x2="97"  y2="64" stroke={line} strokeWidth="0.6" opacity="0.4"/>
      <circle cx="101" cy="64" r="1.5" fill={gold} opacity="0.45"/>
      <polygon points="120,57 128,64 120,71 112,64" fill={gold} opacity="0.85"/>
      <circle cx="139" cy="64" r="1.5" fill={gold} opacity="0.45"/>
      <line x1="143" y1="64" x2="210" y2="64" stroke={line} strokeWidth="0.6" opacity="0.4"/>

      {/* Subtitle */}
      <text
        x="120" y="84"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="12" fontWeight="300"
        fill={gold} textAnchor="middle" letterSpacing="11" opacity="0.75"
      >МЕБЛІ</text>

      {/* Bottom rules */}
      <line x1="20" y1="92" x2="220" y2="92" stroke={line} strokeWidth="0.3" opacity="0.2"/>
      <line x1="20" y1="95" x2="220" y2="95" stroke={line} strokeWidth="0.5" opacity="0.3"/>
    </svg>
  )
}
