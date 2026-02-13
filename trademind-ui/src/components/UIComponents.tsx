import { useRef, useEffect } from 'react'
import { Search, MessageCircle, Star, Flag } from 'lucide-react'

interface SearchInputProps {
  placeholder: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function SearchInput({ placeholder, className = '', value, onChange }: SearchInputProps) {
  return (
    <div className={`bg-input-bg border border-selected rounded-custom flex items-center px-3 py-2.5 focus-within:border-primary transition ${className}`}>
      <Search className="w-4 h-4 text-subtext mr-3" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent border-none text-text w-full text-sm placeholder:text-subtext focus:outline-none"
      />
    </div>
  )
}

interface TabButtonProps {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function TabButton({ active, children, onClick }: TabButtonProps) {
  return (
    <button
      className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition ${active ? 'bg-selected text-heading' : 'text-subtext hover:text-heading'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface ChatInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export function ChatInput({
  placeholder,
  value,
  onChange,
  maxLength = 500
}: ChatInputProps) {
  const isOverLimit = value.length > maxLength
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      // 限制最大2行高度 (约44px)
      textarea.style.height = `${Math.min(textarea.scrollHeight, 44)}px`
    }
  }, [value])

  return (
    <div className="bg-input-bg border border-selected rounded-custom flex flex-col px-4 py-3 focus-within:border-primary transition flex-1">
      <div className="flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-subtext shrink-0 mt-0.5" />
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={1}
          className="bg-transparent border-none text-text w-full text-sm placeholder:text-subtext focus:outline-none resize-none leading-relaxed overflow-y-auto"
          style={{ maxHeight: '44px' }}
        />
      </div>
      {isOverLimit && (
        <div className="text-xs text-danger mt-2 pl-8">
          字数超出限制 ({value.length}/{maxLength})
        </div>
      )}
    </div>
  )
}

interface ScorePickerProps {
  score: number
  onScoreChange: (score: number) => void
}

export function ScorePicker({ score, onScoreChange }: ScorePickerProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-subtext mr-1">评分:</span>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onScoreChange(s === score ? 0 : s)}
          className="p-0.5 hover:scale-110 transition-transform"
          title={`${s}分`}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              score > 0 && s <= score
                ? 'text-primary fill-primary'
                : 'text-subtext hover:text-primary/50'
            }`}
          />
        </button>
      ))}
      {score > 0 && <span className="text-sm font-bold text-primary ml-1 min-w-[2ch]">{score}</span>}
    </div>
  )
}

export function ReportButton() {
  return (
    <button className="text-subtext hover:text-danger transition text-sm flex items-center gap-1">
      <Flag className="w-4 h-4" /> 举报
    </button>
  )
}
