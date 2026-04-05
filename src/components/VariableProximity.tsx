import React, { forwardRef, useRef, useEffect } from 'react';

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: React.RefObject<HTMLElement>;
  radius?: number;
  falloff?: 'linear' | 'gaussian';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 110,
    falloff = 'gaussian',
    className = '',
    onClick,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;
    };

    const updateFrames = () => {
      letterRefs.current.forEach((letterRef) => {
        if (!letterRef) return;
        
        const rect = letterRef.getBoundingClientRect();
        // Mouse coordinate is window based. Bounding client rect is viewport based.
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(currentX - letterCenterX, 2) + Math.pow(currentY - letterCenterY, 2)
        );

        let intensity = 0;
        if (falloff === 'linear') {
          intensity = Math.max(0, 1 - distance / radius);
        } else if (falloff === 'gaussian') {
          intensity = Math.exp(-Math.pow(distance / radius, 2));
        }

        letterRef.style.fontVariationSettings = interpolateSettings(
          fromFontVariationSettings,
          toFontVariationSettings,
          intensity
        );
      });
      animationFrameId = requestAnimationFrame(updateFrames);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(updateFrames);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [fromFontVariationSettings, toFontVariationSettings, radius, falloff]);

  function interpolateSettings(from: string, to: string, intensity: number) {
    const fromParts = from.split(',').map(s => s.trim());
    const toParts = to.split(',').map(s => s.trim());
    
    return fromParts.map((part, i) => {
      const fromMatch = part.match(/('[\w]+')\s+([\d.]+)/);
      const toMatch = toParts[i]?.match(/('[\w]+')\s+([\d.]+)/);

      if (fromMatch && toMatch) {
        const fromValue = parseFloat(fromMatch[2]);
        const toValue = parseFloat(toMatch[2]);
        const mappedValue = fromValue + (toValue - fromValue) * intensity;
        return `${fromMatch[1]} ${mappedValue}`;
      }
      return part;
    }).join(', ');
  }

  return (
    <span ref={ref} className={className} onClick={onClick} style={style} {...restProps}>
      {label.split('').map((char, index) => (
        <span
          key={index}
          ref={(el) => { letterRefs.current[index] = el; }}
          style={{ 
            fontVariationSettings: fromFontVariationSettings,
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            transition: 'font-variation-settings 0.1s ease-out' // Gives natural smoothing
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
