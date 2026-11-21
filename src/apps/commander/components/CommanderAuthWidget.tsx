import AuthWidget from '../../../components/AuthWidget';

interface CommanderAuthWidgetProps {
  className?: string;
}

export default function CommanderAuthWidget({ className = '' }: CommanderAuthWidgetProps) {
  return <AuthWidget theme="commander" className={className} />;
}
