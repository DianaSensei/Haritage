import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/core/config/theme';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'small' | 'heading';
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = 'default',
    ...rest
}: ThemedTextProps) {
    const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const linkColor = useThemeColor({}, 'textLink');
    const mutedColor = useThemeColor({}, 'textMuted');
    
    let resolvedColor = textColor;
    if (type === 'link') {
        resolvedColor = linkColor;
    } else if (type === 'caption' || type === 'small') {
        resolvedColor = mutedColor;
    }

    return (
        <Text
            style={[
                { color: resolvedColor },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'heading' ? styles.heading : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
                type === 'caption' ? styles.caption : undefined,
                type === 'small' ? styles.small : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: Typography.size.md,
        lineHeight: Typography.lineHeight.md,
        fontWeight: Typography.weight.regular,
    },
    defaultSemiBold: {
        fontSize: Typography.size.md,
        lineHeight: Typography.lineHeight.md,
        fontWeight: Typography.weight.semibold,
    },
    title: {
        fontSize: Typography.size.xxxl,
        lineHeight: Typography.lineHeight.xxxl,
        fontWeight: Typography.weight.bold,
        letterSpacing: Typography.letterSpacing.tight,
    },
    heading: {
        fontSize: Typography.size.xxl,
        lineHeight: Typography.lineHeight.xxl,
        fontWeight: Typography.weight.bold,
    },
    subtitle: {
        fontSize: Typography.size.xl,
        lineHeight: Typography.lineHeight.xl,
        fontWeight: Typography.weight.semibold,
    },
    link: {
        fontSize: Typography.size.md,
        lineHeight: Typography.lineHeight.md,
        fontWeight: Typography.weight.medium,
    },
    caption: {
        fontSize: Typography.size.sm,
        lineHeight: Typography.lineHeight.sm,
        fontWeight: Typography.weight.regular,
    },
    small: {
        fontSize: Typography.size.xs,
        lineHeight: Typography.lineHeight.xs,
        fontWeight: Typography.weight.regular,
    },
});
