# Database Column Naming Convention

## Issue
The database uses **snake_case** (PostgreSQL convention) while the frontend TypeScript code uses **camelCase** (JavaScript convention).

## Solution
All API routes transform data between these naming conventions:

### Database (snake_case) ↔ Frontend (camelCase)

| Database Column | Frontend Property |
|----------------|-------------------|
| `budgeting_enabled` | `budgetingEnabled` |
| `budget_limit` | `limit` |
| `user_id` | (internal, not exposed) |
| `created_at` | (optional to expose) |
| `updated_at` | (optional to expose) |

## Implementation

### Categories API
- **GET**: Transforms `budgeting_enabled` → `budgetingEnabled`
- **POST**: Transforms `budgetingEnabled` → `budgeting_enabled`
- **PUT**: Transforms `budgetingEnabled` → `budgeting_enabled`

### Budgets API
- **GET**: Transforms `budget_limit` → `limit`
- **POST**: Transforms `limit` → `budget_limit`
- **PUT**: Transforms `limit` → `budget_limit`

### Other APIs
- Transactions, Tasks, Installments: No transformation needed (all columns match)

## Why This Approach?

1. **Database Best Practice**: PostgreSQL convention is snake_case
2. **Frontend Best Practice**: JavaScript/TypeScript convention is camelCase
3. **No Breaking Changes**: Frontend code continues to work unchanged
4. **API Layer Responsibility**: Transformation happens at the API boundary

## Example

```typescript
// Frontend sends:
{
  name: "Food",
  budgetingEnabled: true
}

// API transforms to database:
{
  name: "Food",
  budgeting_enabled: true
}

// Database returns:
{
  id: "uuid",
  name: "Food",
  budgeting_enabled: true
}

// API transforms back to frontend:
{
  id: "uuid",
  name: "Food",
  budgetingEnabled: true
}
```

## Files Updated
- ✅ `src/app/api/categories/route.ts` - Full transformation
- ✅ `src/app/api/budgets/route.ts` - Full transformation
- ✅ Database schema uses snake_case consistently
- ✅ TypeScript types use camelCase consistently
