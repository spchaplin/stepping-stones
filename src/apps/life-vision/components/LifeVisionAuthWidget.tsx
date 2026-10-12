import AuthWidget from '../../../components/AuthWidget';

interface LifeVisionAuthWidgetProps {
  className?: string;
}

export default function LifeVisionAuthWidget({ className = '' }: LifeVisionAuthWidgetProps) {
  return <AuthWidget theme="lifeVision" className={className} />;
}