import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-balance text-4xl font-bold tracking-tight">IAM Mastery</h1>
      <p className="text-lg text-muted-foreground">
        Foundation shell is up. Routes, libs, and layout components arrive in subsequent tasks.
      </p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Badge>Phase 1</Badge>
        <Badge variant="secondary">Coming</Badge>
      </div>
    </div>
  )
}
