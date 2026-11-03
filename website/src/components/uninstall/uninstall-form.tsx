import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { buildFeedbackEmail, SUPPORT_EMAIL } from '@/lib/feedback-email';
import type { Reason, UninstallCopy } from './copy';

const REASONS: Reason[] = ['broke', 'noEffect', 'notNeeded', 'other'];

export default function UninstallForm({ copy, version }: { copy: UninstallCopy; version?: string }) {
  const [reason, setReason] = useState<Reason | null>(null);
  const [site, setSite] = useState('');
  const [details, setDetails] = useState('');
  const [emailOpened, setEmailOpened] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const invalid = attempted && !reason;
  const hint = reason ? copy.hints[reason] : undefined;

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!reason) {
      event.currentTarget.querySelector<HTMLElement>('[role="radio"]')?.focus();
      return;
    }
    window.location.href = buildFeedbackEmail({ reason, reasonLabel: copy.reasons[reason], site, details, version });
    setEmailOpened(true);
  };

  return (
    <form className="feedback-form" onSubmit={send} noValidate aria-labelledby="reason-label">
      <FieldGroup className="gap-8">
        <FieldSet className="gap-4" data-invalid={invalid || undefined}>
          <FieldLegend id="reason-label" className="mb-0 text-base font-semibold">{copy.reasonLabel}</FieldLegend>
          <RadioGroup value={reason ?? ''} onValueChange={(value) => setReason(value as Reason)} className="gap-3" aria-labelledby="reason-label" aria-invalid={invalid || undefined} aria-describedby={invalid ? 'reason-error' : undefined}>
            {REASONS.map((key) => (
              <Label key={key} htmlFor={`reason-${key}`} className="feedback-reason">
                <RadioGroupItem id={`reason-${key}`} value={key} />{copy.reasons[key]}
              </Label>
            ))}
          </RadioGroup>
          {invalid && <p id="reason-error" role="alert" className="feedback-error">{copy.reasonError}</p>}
          {hint && <p className="feedback-hint">{hint}</p>}
        </FieldSet>

        <Field className="gap-3">
          <FieldLabel className="text-base font-medium" htmlFor="site">{copy.siteLabel}</FieldLabel>
          <Input id="site" name="site" inputMode="url" autoComplete="url" maxLength={2048} value={site} onChange={(e) => setSite(e.target.value)} placeholder={copy.sitePlaceholder} className="feedback-input bg-background px-4 py-3 text-base md:text-base" />
        </Field>

        <Field className="gap-3">
          <FieldLabel className="text-base font-medium" htmlFor="details">{copy.detailsLabel}</FieldLabel>
          <Textarea id="details" name="details" rows={4} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} className="feedback-input min-h-32 resize-y bg-background px-4 py-3 text-base md:text-base" aria-describedby="details-count" />
          <p id="details-count" className="text-right text-xs text-muted-foreground tabular-nums">{details.length} / 2000</p>
        </Field>

        <div className="flex flex-col items-start gap-4">
          <Button type="submit" size="lg" className="w-full whitespace-normal text-left sm:w-auto"><Mail data-icon="inline-start" aria-hidden="true" />{copy.submit}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></Button>
          {emailOpened && <p role="status" className="feedback-status"><Check className="mb-2 size-4" aria-hidden="true" />{copy.sent}</p>}
          <p className="feedback-note">{copy.emailHelp} <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">{SUPPORT_EMAIL}</a></p>
        </div>
      </FieldGroup>
    </form>
  );
}
