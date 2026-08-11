import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
export function HazersScreen() {
  return (
    <Screen>
      <EmptyState
        title={"Find a hazer"}
        body={"You cannot compete without one. Search by region and travel radius, agree the share up front, and settle it on a ledger you both see."}
        actionLabel={"Search hazers"}
      />
    </Screen>
  );
}
