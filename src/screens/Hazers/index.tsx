// src/screens/Hazers/index.tsx
//
// Who hazes for you.
//
// Steer wrestling is the only event here that cannot legally happen without a
// second mounted athlete: no hazer, no run. The scoring engine already treats
// it that way — `scoreSteerWrestlingRun` returns a no time with code NO_HAZER
// before it looks at anything else — so this screen is the other half of that
// rule, on the entry side rather than the scoring side.
//
// A hazer is recorded on the entry as `partner_id`, which is the same column
// team roping uses for the other end. That is deliberate reuse and not a
// coincidence: both are "the other person on this entry", and giving steer
// wrestling its own column would have meant a second code path for the same
// question.

import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Screen } from '@/components/ui/Screen';
import { Stat } from '@/components/ui/Stat';
import { colors } from '@/constants/theme';
import { useSession } from '@/lib/auth';
import { getMyProfile, listMyPartnerEntries, namesFor, type PartnerEntry } from '@/lib/queries';

/** The other person on the entry — for this event, the hazer. */
function otherIdOf(entry: PartnerEntry, me: string): string | null {
  return entry.contestant_id === me ? entry.partner_id : entry.contestant_id;
}

export function HazersScreen() {
  const { user } = useSession();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: Boolean(user?.id),
  });
  const profileId = profileQuery.data?.id;

  const entriesQuery = useQuery({
    queryKey: ['partner-entries', profileId],
    queryFn: () => listMyPartnerEntries(profileId!),
    enabled: Boolean(profileId),
  });

  const rows = entriesQuery.data ?? [];
  const ids = rows.map((e) => otherIdOf(e, profileId ?? '')).filter((id): id is string => Boolean(id));

  const namesQuery = useQuery({
    queryKey: ['names', [...new Set(ids)].sort().join(',')],
    queryFn: () => namesFor(ids),
    enabled: ids.length > 0,
  });

  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const regulars = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>Hazers</Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
          No hazer, no run — the scoring engine returns a no time before it looks at anything else.
          This is who has hazed for you.
        </Text>
      </View>

      {regulars.length > 0 ? (
        <Card title="Rides with you">
          <View style={{ gap: 6 }}>
            {regulars.map(([id, n]) => (
              <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {namesQuery.data?.[id] ?? 'Hazer'}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  {n} {n === 1 ? 'run' : 'runs'}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <QueryBoundary
        isLoading={profileQuery.isLoading || entriesQuery.isLoading}
        error={profileQuery.error ?? entriesQuery.error}
        data={rows}
        onRetry={() => entriesQuery.refetch()}
        empty={
          <EmptyState
            title="No hazer on file"
            body="When a secretary takes your entry with a hazer named on it, they show up here. If you turn up without one you do not compete, so it is worth checking before you haul."
          />
        }
      >
        {(entries) => (
          <View style={{ gap: 12 }}>
            {entries.map((entry) => {
              const otherId = otherIdOf(entry, profileId ?? '');
              const when = entry.rodeos
                ? new Date(`${entry.rodeos.start_date}T00:00:00`).toLocaleDateString()
                : new Date(entry.entered_at).toLocaleDateString();
              return (
                <Card
                  key={entry.id}
                  title={otherId ? (namesQuery.data?.[otherId] ?? 'Hazer') : 'Hazer'}
                  subtitle={[entry.rodeos?.name, when].filter(Boolean).join(' · ')}
                >
                  <Stat label="Entry" value={entry.status} />
                </Card>
              );
            })}
          </View>
        )}
      </QueryBoundary>
    </Screen>
  );
}
