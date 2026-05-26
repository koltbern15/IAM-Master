import { ReadShell } from '@/components/layout/ReadShell'

export default function SettingsPage() {
  return (
    <ReadShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-muted">
          Theme, sound, Anthropic API key, model, export/import placeholders.
        </p>
      </div>
    </ReadShell>
  )
}
