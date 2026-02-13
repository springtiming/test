interface DecisionCardProps {
  symbol: string
  direction: 'LONG' | 'SHORT'
  id: string
  researcher: string
  time: string
  pnl: number
  score: number
  active?: boolean
  onClick?: () => void
}

export default function DecisionCard({
  symbol,
  active,
  onClick
}: DecisionCardProps) {
  const baseToken = symbol.split('/')[0]

  return (
    <div
      className={`mx-3 my-1 p-3 px-4 rounded-custom cursor-pointer transition border border-transparent hover:bg-selected ${active ? 'bg-selected' : ''}`}
      onClick={onClick}
    >
      <div className={`font-bold text-lg flex items-center gap-2 ${active ? 'text-heading' : 'text-subtext'}`}>
        <img src={`/logos/${baseToken}.png`} alt={baseToken} className="w-5 h-5 rounded-full" />
        {symbol}
      </div>
    </div>
  )
}
