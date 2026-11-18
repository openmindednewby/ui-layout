export interface GroupKey {
  id: string;
  title: string;
}

export interface ItemGroup<T> extends GroupKey {
  items: T[];
}

/** Groups items by `groupOf`, keeping first-seen group order and the item order inside each group. */
export function groupItems<T>(items: readonly T[], groupOf: (item: T) => GroupKey): Array<ItemGroup<T>> {
  const groups = new Map<string, ItemGroup<T>>();
  items.forEach((item) => {
    const key = groupOf(item);
    const existing = groups.get(key.id);
    if (existing === undefined) {
      groups.set(key.id, { id: key.id, title: key.title, items: [item] });
    } else {
      existing.items.push(item);
    }
  });
  return Array.from(groups.values());
}
