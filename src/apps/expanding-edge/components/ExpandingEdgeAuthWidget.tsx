import AuthWidget from '../../../components/AuthWidget';

interface ExpandingEdgeAuthWidgetProps {
  className?: string;
}

export default function ExpandingEdgeAuthWidget({ className = '' }: ExpandingEdgeAuthWidgetProps) {
  return <AuthWidget theme="expandingEdge" className={className} />;
}