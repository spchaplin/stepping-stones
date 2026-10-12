import AuthWidget from '../../components/AuthWidget';

interface LandingAuthWidgetProps {
  className?: string;
}

export default function LandingAuthWidget({ className = '' }: LandingAuthWidgetProps) {
  return <AuthWidget theme="landing" className={className} />;
}