import AuthWidget from '../../../components/AuthWidget';

interface PlankAuthWidgetProps {
  className?: string;
}

export default function PlankAuthWidget({ className = '' }: PlankAuthWidgetProps) {
  return <AuthWidget theme="plank" className={className} />;
}