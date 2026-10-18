import type { SVGProps } from 'react';

export interface IconifyIconData {
  body: string;
  width?: number;
  height?: number;
}

interface IconifyIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height' | 'viewBox' | 'children' | 'dangerouslySetInnerHTML'> {
  icon: IconifyIconData;
  size: number;
  disableAnimation?: boolean;
}

function makeStaticBody(body: string): string {
  return body.replace(/<(path|circle)\b([^>]*)>([\s\S]*?)<\/\1>/g, (_element, tag: string, attributes: string, content: string) => {
    let staticAttributes = attributes;
    const staticContent = content.replace(/<animate(Transform)?\b([^>]*)\/>/g, (_animation, isTransform: string | undefined, animationAttributes: string) => {
      const getAttribute = (name: string) => animationAttributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
      const name = isTransform ? 'transform' : getAttribute('attributeName');
      const value = isTransform
        ? `${getAttribute('type')}(${getAttribute('values')?.split(';').at(-1) ?? ''})`
        : getAttribute('to') ?? getAttribute('values')?.split(';').at(-1);

      if (name && value) {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const attributePattern = new RegExp(`\\s${escapedName}="[^"]*"`);
        staticAttributes = attributePattern.test(staticAttributes)
          ? staticAttributes.replace(attributePattern, ` ${name}="${value}"`)
          : `${staticAttributes} ${name}="${value}"`;
      }

      return '';
    });

    return `<${tag}${staticAttributes}>${staticContent}</${tag}>`;
  });
}

function setStrokeWidth(body: string, strokeWidth: SVGProps<SVGSVGElement>['strokeWidth']): string {
  if (strokeWidth === undefined) return body;
  return body.replace(/(\bstroke-width=")[^"]*(")/g, `$1${strokeWidth}$2`);
}

export default function IconifyIcon({
  icon,
  size,
  className,
  style,
  strokeWidth,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  disableAnimation = false,
  ...svgProps
}: IconifyIconProps) {
  const body = disableAnimation ? makeStaticBody(icon.body) : icon.body;

  return (
    <svg
      {...svgProps}
      aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
      aria-label={ariaLabel}
      focusable="false"
      width={size}
      height={size}
      viewBox={`0 0 ${icon.width ?? 24} ${icon.height ?? 24}`}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: setStrokeWidth(body, strokeWidth) }}
    />
  );
}
