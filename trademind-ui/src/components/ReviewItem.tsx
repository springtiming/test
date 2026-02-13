import { Star, ThumbsUp, Trash2 } from 'lucide-react'

interface ReviewItemProps {
  id: string
  authorId: string
  avatar: string
  name: string
  level: string
  title: string
  score: number
  content: string
  date: string
  likes: number
  liked: boolean
  canLike: boolean
  canDelete: boolean
  onLike: () => void
  onDelete: () => void
}

export default function ReviewItem({
  avatar,
  name,
  level,
  title,
  score,
  content,
  date,
  likes,
  liked,
  canLike,
  canDelete,
  onLike,
  onDelete
}: ReviewItemProps) {
  const isHighScore = score >= 8

  return (
    <div className="border-b border-border py-4 group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`}
            className="w-8 h-8 rounded-full bg-border"
            alt={name}
          />
          <div>
            <div className="text-sm font-bold text-heading">{name}</div>
            <div className="text-xs text-subtext">{level} {title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${isHighScore ? 'text-primary' : 'text-subtext'}`}>
            <Star className={`w-4 h-4 ${isHighScore ? 'fill-current' : ''}`} />
            <span className="font-bold text-sm">{score.toFixed(1)}</span>
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-subtext hover:text-danger transition p-1"
              title="删除评价"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-text leading-relaxed pl-11 mb-2 whitespace-pre-wrap break-words">
        {content}
      </p>
      <div className="pl-11 flex gap-4 text-xs text-subtext">
        <span>{date}</span>
        <button
          onClick={onLike}
          disabled={!canLike}
          className={`flex items-center gap-1 transition ${
            canLike
              ? liked
                ? 'text-primary'
                : 'hover:text-primary'
              : 'cursor-not-allowed opacity-60'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          {likes}
        </button>
      </div>
    </div>
  )
}
