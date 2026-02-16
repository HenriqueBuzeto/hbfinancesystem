'use client';

import { PlanGate } from '@/components/plans/PlanGate';
import { ProContent } from '@/components/pro/ProContent';
import { ProLockedView } from '@/components/pro/ProLockedView';

export default function ProPage() {
  return (
    <PlanGate feature="proTab" requiredPlan="PRO" fallback={<ProLockedView />}>
      <ProContent />
    </PlanGate>
  );
}
