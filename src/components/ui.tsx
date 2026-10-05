import Feather from '@expo/vector-icons/Feather';
import React, { createContext, useContext } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Svg, { Circle, Path, Line, Rect } from 'react-native-svg';

export const colors = {
  navy: '#0B2A5B',
  blue: '#3B82F6',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  ink: '#162C49',
  muted: '#64748B',
  line: '#E5EBF2',
  green: '#157A55',
  yellow: '#F4C542',
  red: '#A64032',
  blueTint: '#EAF1FC',
  greenTint: '#E9F5EF',
};
export const FontReadyContext = createContext(false);
export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({
  name,
  size = 20,
  color = colors.navy,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} accessible={false} aria-hidden />;
}
export function T({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: 'body' | 'small' | 'label' | 'title' | 'heading' | 'display' }) {
  const fonts = useContext(FontReadyContext);
  const title = ['title', 'heading', 'display'].includes(variant);
  const bold = title || variant === 'label';
  return (
    <Text
      {...props}
      style={[
        styles.text,
        typography[variant],
        fonts
          ? { fontFamily: title ? 'HeadingBold' : bold ? 'BodyBold' : 'Body' }
          : { fontWeight: bold ? '700' : '400' },
        style,
      ]}
    />
  );
}
export function Button({
  title,
  onPress,
  icon,
  tone = 'primary',
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const dark = tone === 'primary' || tone === 'danger';
  const color = dark ? colors.white : colors.navy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            tone === 'primary'
              ? colors.navy
              : tone === 'secondary'
                ? colors.blueTint
                : tone === 'danger'
                  ? colors.red
                  : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <T variant="label" style={{ color }}>
        {title}
      </T>
      {icon && <Icon name={icon} size={17} color={color} />}
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Tag({
  text,
  color = colors.navy,
  background = colors.blueTint,
  icon,
}: {
  text: string;
  color?: string;
  background?: string;
  icon?: IconName;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      {icon && <Icon name={icon} size={12} color={color} />}
      <T variant="small" style={{ color, fontSize: 11, fontWeight: '600' }}>
        {text}
      </T>
    </View>
  );
}
export function ProgressBar({
  value,
  color = colors.blue,
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={styles.progress}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
          borderRadius: 10,
        }}
      />
    </View>
  );
}
export function SectionTitle({
  title,
  caption,
  action,
}: {
  title: string;
  caption?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={{ flex: 1, gap: 5 }}>
        <T variant="heading">{title}</T>
        {caption && <T variant="small">{caption}</T>}
      </View>
      {action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={styles.textAction}
        >
          <T variant="label" style={{ fontSize: 13 }}>
            {action.label}
          </T>
          <Icon name="arrow-right" size={15} />
        </Pressable>
      )}
    </View>
  );
}
export function Empty({
  icon = 'book-open',
  title,
  description,
  children,
}: {
  icon?: IconName;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 40, gap: 15 }}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={25} />
      </View>
      <T variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </T>
      <T style={{ color: colors.muted, textAlign: 'center', maxWidth: 450 }}>{description}</T>
      {children}
    </Card>
  );
}
export function BrazilMark() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <Svg width={24} height={17} viewBox="0 0 28 20" aria-hidden>
        <Rect width={28} height={20} rx={2} fill="#009B3A" />
        <Path d="M14 2.5 L25 10 L14 17.5 L3 10 Z" fill="#FFDF00" />
        <Circle cx={14} cy={10} r={4.7} fill="#002776" />
        <Path d="M9.5 9.3 C12 8.1 15 8.9 18.5 11" stroke="#FFFFFF" strokeWidth={1.2} fill="none" />
      </Svg>
      <T variant="small" style={{ fontSize: 12 }}>
        Feito no Brasil. Para ir mais longe.
      </T>
    </View>
  );
}
export function Compass({ size = 210, muted = false }: { size?: number; muted?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" aria-hidden>
      <Circle
        cx="120"
        cy="120"
        r="105"
        stroke={muted ? '#DCE6F4' : '#D3E1F4'}
        strokeWidth="1"
        fill="none"
      />
      <Circle
        cx="120"
        cy="120"
        r="80"
        stroke="#D3E1F4"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 7"
      />
      <Circle cx="120" cy="120" r="56" stroke="#D3E1F4" strokeWidth="1" fill="none" />
      <Line x1="120" y1="8" x2="120" y2="232" stroke="#D3E1F4" />
      <Line x1="8" y1="120" x2="232" y2="120" stroke="#D3E1F4" />
      <Path
        d="M120 28 L138 102 L212 120 L138 138 L120 212 L102 138 L28 120 L102 102 Z"
        fill="#FFFFFF"
        stroke="#C3D5EC"
      />
      <Path d="M120 28 L120 120 L102 102 Z" fill={colors.navy} />
      <Path d="M120 212 L120 120 L138 138 Z" fill={colors.blue} />
      <Path d="M28 120 L120 120 L102 138 Z" fill={colors.blue} />
      <Path d="M212 120 L120 120 L138 102 Z" fill={colors.navy} />
      <Circle cx="120" cy="120" r="7" fill={colors.green} />
      <Circle cx="120" cy="15" r="3" fill={colors.yellow} />
    </Svg>
  );
}

const typography = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 24 },
  small: { fontSize: 13, lineHeight: 20, color: colors.muted },
  label: { fontSize: 14, lineHeight: 21 },
  title: { fontSize: 30, lineHeight: 39, letterSpacing: -1 },
  heading: { fontSize: 19, lineHeight: 27, letterSpacing: -0.5 },
  display: { fontSize: 40, lineHeight: 48, letterSpacing: -1.4 },
});
const styles = StyleSheet.create({
  text: { color: colors.ink },
  button: {
    minHeight: 46,
    paddingVertical: 12,
    paddingHorizontal: 19,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  progress: { backgroundColor: '#E9EEF5', height: 6, borderRadius: 10, overflow: 'hidden' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 17 },
  textAction: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
