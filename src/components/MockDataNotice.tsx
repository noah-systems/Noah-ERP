import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/components/ui/utils';

type MockDataNoticeProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function MockDataNotice({
  title = 'Integração em desenvolvimento',
  description = 'Os dados reais serão exibidos assim que a API estiver disponível.',
  className,
}: MockDataNoticeProps) {
  return (
    <Alert
      className={cn(
        'bg-[rgba(255,255,255,0.05)] text-[var(--noah-text)] border border-[rgba(255,255,255,0.14)]',
        className,
      )}
    >
      <AlertCircle className="text-[var(--noah-primary)]" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
