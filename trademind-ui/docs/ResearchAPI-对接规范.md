# Research API 对接规范（TradeMind UI）

本文档定义 `trademind-ui` 调用 `research api` 的**前端约定**：鉴权、错误处理、分页与建议的 endpoint 形态。具体路径/字段可按你们实际后端调整，但建议保持“决策对象（Decision）为中心”的资源模型。

## 1. 基础约定

### Base URL
- 环境变量：`VITE_RESEARCH_API_BASE_URL`
- 示例：`http://localhost:8000` 或 `https://research-api.example.com`

### 时间与数值
- 时间统一用 ISO 8601（如 `2026-02-10T09:30:00Z`），避免 `yyyy-MM-dd HH:mm:ss` 的时区歧义。
- `pnl`：百分比用 `number`（如 `5.23` 表示 +5.23%）。
- 金额字段（如 `pnlAmount`）建议明确币种或计价单位（如 USDT）。

### 响应包裹（建议）
为统一错误处理与扩展字段，建议后端返回：
```json
{
  "data": {},
  "requestId": "xxx",
  "error": null
}
```
发生错误时：
```json
{
  "data": null,
  "requestId": "xxx",
  "error": { "code": "UNAUTHORIZED", "message": "..." }
}
```

## 2. 鉴权（两种可选，二选一即可）

### 方案 A：Bearer Token（推荐）
- UI 登录后拿到 `accessToken`
- 请求头：`Authorization: Bearer <token>`
- 401：前端清理 token，弹登录/跳转

### 方案 B：Cookie Session
- `fetch`/axios 携带 `credentials: "include"`
- 401：同上

## 3. 核心资源与字段映射

### Decision（对应前端 `src/types/decision.ts`）
最小字段（与现有 mock 对齐）：
- `id`、`symbol`、`direction`、`status`
- `researcher`（建议拆分为 `researcherId` + `researcherName`，前端可兼容）
- `entryTime`、`entryPrice`、`entryReason`
- `exitTime?`、`exitPrice?`、`exitReason?`
- `pnl?`、`pnlAmount?`
- `stopLoss?`、`takeProfit?`
- `score?`、`reviewCount?`
- `createdAt`、`updatedAt`

### Review（对应前端 `src/types/review.ts`）
- `id`、`decisionId`
- `authorId`、`authorName`、`authorAvatar`、`authorLevel`、`authorTitle`
- `score`（1-10）
- `content`
- `createdAt`
- `likes`、`likedBy`（如果后端不想回 `likedBy`，可改为 `likedByMe: boolean`）

## 4. Endpoint 设计（建议）

### 4.1 决策列表
`GET /decisions`

Query（与 `DecisionFilter` 对齐 + 扩展）：
- `symbol?`
- `direction?=LONG|SHORT`
- `status?=open|closed|cancelled`
- `researcher?`（或 `researcherId?`）
- `dateFrom?`、`dateTo?`
- `sort?=hot|new|pnl|score`
- 分页二选一：
  - offset 分页：`page`、`pageSize`
  - cursor 分页：`cursor`、`limit`

Response（建议）：
```json
{
  "items": [
    { "id": "T2039", "symbol": "BTC/USDT", "direction": "LONG", "researcher": "DeepSeek AI", "status": "closed", "pnl": 5.23, "score": 9.2, "reviewCount": 12, "createdAt": "..." }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 156
}
```

### 4.2 决策详情
`GET /decisions/{id}`

Response：返回完整 `Decision`（DecisionLog）。

### 4.3 决策图表数据（K 线 + 标记）
如果 research api 同时提供行情/回测产物，建议独立 endpoint：

`GET /decisions/{id}/chart`

Query：
- `timeframe=3m|4h`
- `from?`、`to?`（可选）

Response：
```json
{
  "candles": [ { "time": 1700000000, "open": 1, "high": 2, "low": 0.5, "close": 1.5, "volume": 123 } ],
  "markers": [ { "time": 1700000000, "type": "buy", "action": "buy_to_enter", "price": 123.4, "label": "做多入场" } ]
}
```
说明：
- `time` 建议使用 epoch seconds（与 `lightweight-charts` 直接对齐）。
- 若行情由其他服务提供，可把该接口拆到 market api；TradeMind UI 只要求“可绘制”。

### 4.4 评价列表
`GET /decisions/{id}/reviews`

Query：
- `sort=hot|new`
- `page`、`pageSize`

### 4.5 发表评价
`POST /decisions/{id}/reviews`

Body：
```json
{ "content": "....", "score": 8 }
```

### 4.6 点赞/取消点赞
二选一：
- `POST /reviews/{id}/like`（服务端切换）
- 或 `PUT /reviews/{id}/like` + `DELETE /reviews/{id}/like`

### 4.7 删除评价
`DELETE /reviews/{id}`

权限：
- admin：可删任意
- researcher：可删自己的

### 4.8 研究员榜单
`GET /researchers/ranking`

Query：
- `tab=overall|accuracy|contribution|newstar`
- `page`、`pageSize`
- `q?`（搜索）

### 4.9 研究员申请与审核
- `POST /researchers/applications`（guest 发起）
- `GET /admin/researcher-applications?status=pending`（admin 查看）
- `POST /admin/researcher-applications/{id}/approve`
- `POST /admin/researcher-applications/{id}/reject`

### 4.10 复盘统计（聚合分析）
`GET /analytics/decisions/summary`

Query：
- `dateFrom`、`dateTo`
- `symbol?`、`researcherId?`、`direction?`、`status?`

Response（对应前端 `DecisionStats`）：
```json
{
  "totalTrades": 156,
  "winRate": 62.5,
  "profitFactor": 1.85,
  "avgPnl": 3.2,
  "maxDrawdown": 12.5,
  "sharpeRatio": 1.42,
  "totalPnl": 45.8
}
```

## 5. 错误码建议

建议最少覆盖：
- `UNAUTHORIZED`（401）
- `FORBIDDEN`（403）
- `NOT_FOUND`（404）
- `VALIDATION_ERROR`（400）
- `RATE_LIMITED`（429）
- `INTERNAL_ERROR`（500）

前端展示：
- 错误 toast（短）+ 页面错误态（长）
- 带 `requestId`，便于后端定位

## 6. 本地开发建议（CORS/代理）

推荐在 Vite 配置里对 `/api` 走 proxy，然后 UI 请求统一以相对路径发出：
- 前端：`/api/decisions`
- Vite proxy：`/api` → `${VITE_RESEARCH_API_BASE_URL}`

这样可避免浏览器 CORS 与多环境切换复杂度。

