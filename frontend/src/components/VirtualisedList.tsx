'use client'

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualisedListProps<T> {
    items: T[];
    height: number;
    itemHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
}

function VirtualisedList<T>({
    items,
    height,
    itemHeight,
    renderItem,
    className = ''
}: VirtualisedListProps<T>) {
    const Row = useMemo(() => {
        return ({ index, style }: { index: number; style: React.CSSProperties }) => (
            <div style={style}>
                {renderItem(items[index], index)}
            </div>
        );
    }, [items, renderItem]);

    return (
        <div className={className}>
            <List
                height={height}
                itemCount={items.length}
                itemSize={itemHeight}
                width="100%"
            >
                {Row}
            </List>
        </div>
    );
}
export default VirtualisedList;