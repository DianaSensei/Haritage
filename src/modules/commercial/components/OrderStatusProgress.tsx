import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrderProgressStatus, OrderTimelineEntry } from '@/modules/commercial/types';
import { ThemedText } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

interface OrderStatusProgressProps {
  timeline: OrderTimelineEntry[];
  labelForStatus: (status: OrderProgressStatus) => string;
  timeForStatus?: (status: OrderProgressStatus, timestamp: string | null) => string | undefined;
}

export const OrderStatusProgress: React.FC<OrderStatusProgressProps> = ({
  timeline,
  labelForStatus,
  timeForStatus,
}) => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const firstPendingIndex = useMemo(() => timeline.findIndex((step) => step.timestamp === null), [timeline]);
  const completedCount = firstPendingIndex === -1 ? timeline.length : firstPendingIndex;

  return (
    <View style={styles.container}>
      {timeline.map((entry, index) => {
        const isCompleted = index < completedCount && entry.timestamp !== null;
        const isCurrent = index === completedCount && entry.timestamp === null;
        const dotColor = isCompleted
          ? colors.accentStrong
          : isCurrent
          ? colors.accentSoft
          : colors.border;
        const dotFill = isCompleted
          ? colors.accentStrong
          : isCurrent
          ? colors.accentSoft
          : colors.surface;
        const barColor = index < completedCount - 1 ? colors.accentStrong : colors.border;
        const timeLabel = timeForStatus?.(entry.status, entry.timestamp);

        return (
          <View key={entry.status} style={styles.row}>
            <View style={styles.iconColumn}>
              <View style={[styles.dot, { borderColor: dotColor, backgroundColor: dotFill }]} />
              {index < timeline.length - 1 ? (
                <View style={[styles.connector, { backgroundColor: barColor }]} />
              ) : null}
            </View>
            <View style={styles.metaColumn}>
              <ThemedText style={styles.statusLabel}>{labelForStatus(entry.status)}</ThemedText>
              {timeLabel ? <ThemedText style={styles.timestampLabel}>{timeLabel}</ThemedText> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    iconColumn: {
      alignItems: 'center',
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1.5,
    },
    connector: {
      width: 2,
      flex: 1,
      marginTop: 4,
      marginBottom: -4,
    },
    metaColumn: {
      flex: 1,
      gap: 2,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    timestampLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
  });
